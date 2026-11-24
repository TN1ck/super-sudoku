import {SimpleSudoku} from "./types";

const FULL_MASK = 0x1ff;

// Module-local lookup tables to avoid per-iteration math and module-getter overhead.
const ROW_OF = new Uint8Array(81);
const COL_OF = new Uint8Array(81);
const BOX_OF = new Uint8Array(81);
for (let i = 0; i < 81; i++) {
  const r = (i / 9) | 0;
  const c = i % 9;
  ROW_OF[i] = r;
  COL_OF[i] = c;
  BOX_OF[i] = ((r / 3) | 0) * 3 + ((c / 3) | 0);
}

const POPCOUNT = new Uint8Array(512);
const BIT_TO_NUM = new Uint8Array(512);
for (let m = 1; m < 512; m++) {
  POPCOUNT[m] = POPCOUNT[m >> 1] + (m & 1);
}
for (let d = 1; d <= 9; d++) {
  BIT_TO_NUM[1 << (d - 1)] = d;
}

// Reusable scratch buffers (solver is synchronous and non-reentrant).
const boardBuf = new Uint8Array(81);
const rowMask = new Uint16Array(9);
const colMask = new Uint16Array(9);
const boxMask = new Uint16Array(9);
const emptyCells = new Uint8Array(81);
const trailCells = new Uint8Array(81);
const trailBits = new Uint16Array(81);
const rowOnce = new Uint16Array(9);
const rowTwice = new Uint16Array(9);
const colOnce = new Uint16Array(9);
const colTwice = new Uint16Array(9);
const boxOnce = new Uint16Array(9);
const boxTwice = new Uint16Array(9);

interface SearchState {
  count: number;
  iterations: number;
  captureFirst: boolean;
  captureSecond: boolean;
  firstFlat: Uint8Array | null;
  secondFlat: Uint8Array | null;
}

function flatToSimpleSudoku(flat: Uint8Array): SimpleSudoku {
  const result: SimpleSudoku = new Array(9);
  for (let r = 0; r < 9; r++) {
    const base = r * 9;
    result[r] = [
      flat[base],
      flat[base + 1],
      flat[base + 2],
      flat[base + 3],
      flat[base + 4],
      flat[base + 5],
      flat[base + 6],
      flat[base + 7],
      flat[base + 8],
    ];
  }
  return result;
}

function unwindTrail(trailTop: number, savedTrailTop: number): void {
  while (trailTop > savedTrailTop) {
    trailTop--;
    const idx = trailCells[trailTop];
    const bit = trailBits[trailTop];
    boardBuf[idx] = 0;
    rowMask[ROW_OF[idx]] ^= bit;
    colMask[COL_OF[idx]] ^= bit;
    boxMask[BOX_OF[idx]] ^= bit;
  }
}

function search(emptyCount: number, trailTop: number, limit: number, state: SearchState): void {
  if (state.count >= limit) {
    return;
  }

  const savedTrailTop = trailTop;
  let curEmpty = emptyCount;

  while (true) {
    state.iterations++;

    if (curEmpty === 0) {
      state.count++;
      if (state.count === 1 && state.captureFirst) {
        state.firstFlat = boardBuf.slice();
      } else if (state.count === 2 && state.captureSecond) {
        state.secondFlat = boardBuf.slice();
      }
      unwindTrail(trailTop, savedTrailTop);
      return;
    }

    // Pass 1: Naked-single propagation + MRV selection.
    let foundNaked = false;
    let bestK = -1;
    let bestAvail = 0;
    let bestCount = 10;

    for (let k = 0; k < curEmpty; k++) {
      const idx = emptyCells[k];
      const r = ROW_OF[idx];
      const c = COL_OF[idx];
      const b = BOX_OF[idx];
      const avail = ~(rowMask[r] | colMask[c] | boxMask[b]) & FULL_MASK;
      if (avail === 0) {
        unwindTrail(trailTop, savedTrailTop);
        return;
      }
      if ((avail & (avail - 1)) === 0) {
        boardBuf[idx] = BIT_TO_NUM[avail];
        rowMask[r] |= avail;
        colMask[c] |= avail;
        boxMask[b] |= avail;
        trailCells[trailTop] = idx;
        trailBits[trailTop] = avail;
        trailTop++;
        curEmpty--;
        emptyCells[k] = emptyCells[curEmpty];
        emptyCells[curEmpty] = idx;
        k--;
        foundNaked = true;
        continue;
      }
      if (!foundNaked) {
        const cnt = POPCOUNT[avail];
        if (cnt < bestCount) {
          bestCount = cnt;
          bestK = k;
          bestAvail = avail;
        }
      }
    }

    if (foundNaked) {
      continue;
    }

    // Pass 2: Hidden-single propagation and unit dead-end detection across all 27 units.
    rowOnce.fill(0);
    rowTwice.fill(0);
    colOnce.fill(0);
    colTwice.fill(0);
    boxOnce.fill(0);
    boxTwice.fill(0);

    for (let k = 0; k < curEmpty; k++) {
      const idx = emptyCells[k];
      const r = ROW_OF[idx];
      const c = COL_OF[idx];
      const b = BOX_OF[idx];
      const avail = ~(rowMask[r] | colMask[c] | boxMask[b]) & FULL_MASK;
      rowTwice[r] |= rowOnce[r] & avail;
      rowOnce[r] |= avail;
      colTwice[c] |= colOnce[c] & avail;
      colOnce[c] |= avail;
      boxTwice[b] |= boxOnce[b] & avail;
      boxOnce[b] |= avail;
    }

    let hiddenBit = 0;
    let hiddenUnitType = 0; // 1 = row, 2 = col, 3 = box
    let hiddenUnit = -1;

    for (let u = 0; u < 9; u++) {
      if (
        (rowOnce[u] | rowMask[u]) !== FULL_MASK ||
        (colOnce[u] | colMask[u]) !== FULL_MASK ||
        (boxOnce[u] | boxMask[u]) !== FULL_MASK
      ) {
        unwindTrail(trailTop, savedTrailTop);
        return;
      }
      if (hiddenUnit === -1) {
        const rh = rowOnce[u] & ~rowTwice[u];
        if (rh !== 0) {
          hiddenBit = rh & -rh;
          hiddenUnitType = 1;
          hiddenUnit = u;
        } else {
          const ch = colOnce[u] & ~colTwice[u];
          if (ch !== 0) {
            hiddenBit = ch & -ch;
            hiddenUnitType = 2;
            hiddenUnit = u;
          } else {
            const bh = boxOnce[u] & ~boxTwice[u];
            if (bh !== 0) {
              hiddenBit = bh & -bh;
              hiddenUnitType = 3;
              hiddenUnit = u;
            }
          }
        }
      }
    }

    if (hiddenUnit !== -1) {
      for (let k = 0; k < curEmpty; k++) {
        const idx = emptyCells[k];
        const r = ROW_OF[idx];
        const c = COL_OF[idx];
        const b = BOX_OF[idx];
        const inUnit =
          (hiddenUnitType === 1 && r === hiddenUnit) ||
          (hiddenUnitType === 2 && c === hiddenUnit) ||
          (hiddenUnitType === 3 && b === hiddenUnit);
        if (inUnit && (~(rowMask[r] | colMask[c] | boxMask[b]) & hiddenBit) !== 0) {
          boardBuf[idx] = BIT_TO_NUM[hiddenBit];
          rowMask[r] |= hiddenBit;
          colMask[c] |= hiddenBit;
          boxMask[b] |= hiddenBit;
          trailCells[trailTop] = idx;
          trailBits[trailTop] = hiddenBit;
          trailTop++;
          curEmpty--;
          emptyCells[k] = emptyCells[curEmpty];
          emptyCells[curEmpty] = idx;
          break;
        }
      }
      continue;
    }

    // No forced moves remain: branch on the MRV cell found in Pass 1.
    const branchIdx = emptyCells[bestK];
    const br = ROW_OF[branchIdx];
    const bc = COL_OF[branchIdx];
    const bb = BOX_OF[branchIdx];
    curEmpty--;
    emptyCells[bestK] = emptyCells[curEmpty];
    emptyCells[curEmpty] = branchIdx;

    let m = bestAvail;
    while (m !== 0) {
      const bit = m & -m;
      m ^= bit;
      boardBuf[branchIdx] = BIT_TO_NUM[bit];
      rowMask[br] |= bit;
      colMask[bc] |= bit;
      boxMask[bb] |= bit;

      search(curEmpty, trailTop, limit, state);

      rowMask[br] ^= bit;
      colMask[bc] ^= bit;
      boxMask[bb] ^= bit;
      boardBuf[branchIdx] = 0;

      if (state.count >= limit) {
        break;
      }
    }

    unwindTrail(trailTop, savedTrailTop);
    return;
  }
}

function loadBoard(sudoku: SimpleSudoku): number {
  rowMask.fill(0);
  colMask.fill(0);
  boxMask.fill(0);
  let emptyCount = 0;

  for (let r = 0; r < 9; r++) {
    const row = sudoku[r];
    const base = r * 9;
    for (let c = 0; c < 9; c++) {
      const val = row[c];
      const idx = base + c;
      boardBuf[idx] = val;
      if (val === 0) {
        emptyCells[emptyCount++] = idx;
      } else {
        const bit = 1 << (val - 1);
        const b = BOX_OF[idx];
        if (((rowMask[r] | colMask[c] | boxMask[b]) & bit) !== 0) {
          return -1;
        }
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;
      }
    }
  }
  return emptyCount;
}

function loadFlatBoard(flat: Uint8Array): number {
  rowMask.fill(0);
  colMask.fill(0);
  boxMask.fill(0);
  let emptyCount = 0;

  for (let idx = 0; idx < 81; idx++) {
    const val = flat[idx];
    boardBuf[idx] = val;
    if (val === 0) {
      emptyCells[emptyCount++] = idx;
    } else {
      const bit = 1 << (val - 1);
      const r = ROW_OF[idx];
      const c = COL_OF[idx];
      const b = BOX_OF[idx];
      if (((rowMask[r] | colMask[c] | boxMask[b]) & bit) !== 0) {
        return -1;
      }
      rowMask[r] |= bit;
      colMask[c] |= bit;
      boxMask[b] |= bit;
    }
  }
  return emptyCount;
}

export function hasSolution(sudoku: SimpleSudoku): boolean {
  const emptyCount = loadBoard(sudoku);
  if (emptyCount < 0) {
    return false;
  }
  const state: SearchState = {
    count: 0,
    iterations: 0,
    captureFirst: false,
    captureSecond: false,
    firstFlat: null,
    secondFlat: null,
  };
  search(emptyCount, 0, 1, state);
  return state.count > 0;
}

export function hasUniqueSolution(sudoku: SimpleSudoku): boolean {
  const emptyCount = loadBoard(sudoku);
  if (emptyCount < 0) {
    return false;
  }
  const state: SearchState = {
    count: 0,
    iterations: 0,
    captureFirst: false,
    captureSecond: false,
    firstFlat: null,
    secondFlat: null,
  };
  search(emptyCount, 0, 2, state);
  return state.count === 1;
}

export function hasSolutionFlat(flat: Uint8Array): boolean {
  const emptyCount = loadFlatBoard(flat);
  if (emptyCount < 0) {
    return false;
  }
  const state: SearchState = {
    count: 0,
    iterations: 0,
    captureFirst: false,
    captureSecond: false,
    firstFlat: null,
    secondFlat: null,
  };
  search(emptyCount, 0, 1, state);
  return state.count > 0;
}

export function countSolutionsFlat(
  flat: Uint8Array,
  limit: number = 2,
): {count: number; firstFlat: Uint8Array | null; secondFlat: Uint8Array | null} {
  if (limit <= 0) {
    return {count: 0, firstFlat: null, secondFlat: null};
  }
  const emptyCount = loadFlatBoard(flat);
  if (emptyCount < 0) {
    return {count: 0, firstFlat: null, secondFlat: null};
  }
  const state: SearchState = {
    count: 0,
    iterations: 0,
    captureFirst: true,
    captureSecond: limit >= 2,
    firstFlat: null,
    secondFlat: null,
  };
  search(emptyCount, 0, limit, state);
  return {
    count: state.count,
    firstFlat: state.firstFlat,
    secondFlat: state.secondFlat,
  };
}

export function countSolutions(
  sudoku: SimpleSudoku,
  limit: number = 2,
): {count: number; firstSolution: SimpleSudoku | null; iterations: number} {
  if (limit <= 0) {
    return {count: 0, firstSolution: null, iterations: 0};
  }

  const emptyCount = loadBoard(sudoku);
  if (emptyCount < 0) {
    return {
      count: 0,
      firstSolution: null,
      iterations: Infinity,
    };
  }

  const state: SearchState = {
    count: 0,
    iterations: 0,
    captureFirst: true,
    captureSecond: false,
    firstFlat: null,
    secondFlat: null,
  };
  search(emptyCount, 0, limit, state);

  return {
    count: state.count,
    firstSolution: state.firstFlat ? flatToSimpleSudoku(state.firstFlat) : null,
    iterations: state.iterations,
  };
}

export function solveBacktracking(sudoku: SimpleSudoku): {sudoku: SimpleSudoku | null; iterations: number} {
  const {firstSolution, iterations} = countSolutions(sudoku, 1);
  if (firstSolution === null) {
    return {
      sudoku: null,
      iterations: Infinity,
    };
  }
  return {
    sudoku: firstSolution,
    iterations,
  };
}
