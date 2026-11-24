import {SimpleSudoku} from "./types";
import {solveBacktracking} from "./solverBacktracking_bitmask";

export type DomainSudoku = number[][][];

const FULL_MASK = 0x1ff;
const MAX_AC3_ITERATIONS = 4000;

// Module-local lookup tables to avoid per-iteration math and ESM getter overhead.
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

// Reusable flat stack buffer (max live frames is at most 81 * 8 + 1 = 649).
const INITIAL_STACK_CAPACITY = 700;
let stackBuf = new Uint16Array(INITIAL_STACK_CAPACITY * 81);
const rowFixed = new Uint16Array(9);
const colFixed = new Uint16Array(9);
const boxFixed = new Uint16Array(9);
const branchBits = new Uint16Array(9);

function ensureStackCapacity(neededFrames: number): void {
  const currentFrames = (stackBuf.length / 81) | 0;
  if (neededFrames <= currentFrames) {
    return;
  }
  const next = new Uint16Array(Math.max(neededFrames, currentFrames * 2) * 81);
  next.set(stackBuf);
  stackBuf = next;
}

function frameToSimpleSudoku(buf: Uint16Array, base: number): SimpleSudoku {
  const result: SimpleSudoku = new Array(9);
  for (let r = 0; r < 9; r++) {
    const rowBase = base + r * 9;
    result[r] = [
      BIT_TO_NUM[buf[rowBase]],
      BIT_TO_NUM[buf[rowBase + 1]],
      BIT_TO_NUM[buf[rowBase + 2]],
      BIT_TO_NUM[buf[rowBase + 3]],
      BIT_TO_NUM[buf[rowBase + 4]],
      BIT_TO_NUM[buf[rowBase + 5]],
      BIT_TO_NUM[buf[rowBase + 6]],
      BIT_TO_NUM[buf[rowBase + 7]],
      BIT_TO_NUM[buf[rowBase + 8]],
    ];
  }
  return result;
}

function solveBitmaskStack(
  initialTop: number,
  initialIterations: number,
): {
  sudoku: SimpleSudoku | null;
  iterations: number;
  hitLimit: boolean;
} {
  let sp = initialTop;
  let iterations = initialIterations;

  while (sp >= 0) {
    iterations++;
    // Evil puzzles average ~500 iterations; anything beyond 4000 falls back to backtracking.
    if (iterations > MAX_AC3_ITERATIONS) {
      return {
        sudoku: null,
        iterations: Infinity,
        hitLimit: true,
      };
    }

    const base = sp * 81;

    // 1. Collect all currently-singleton cells and detect any direct unit conflicts.
    rowFixed.fill(0);
    colFixed.fill(0);
    boxFixed.fill(0);
    let conflict = false;
    for (let i = 0; i < 81; i++) {
      const d = stackBuf[base + i];
      if (d === 0) {
        conflict = true;
        break;
      }
      if ((d & (d - 1)) === 0) {
        const r = ROW_OF[i];
        const c = COL_OF[i];
        const b = BOX_OF[i];
        if (((rowFixed[r] | colFixed[c] | boxFixed[b]) & d) !== 0) {
          conflict = true;
          break;
        }
        rowFixed[r] |= d;
        colFixed[c] |= d;
        boxFixed[b] |= d;
      }
    }

    if (conflict) {
      sp--;
      continue;
    }

    // 2. Single constraint-propagation pass in row-major order (matches the paper's iteration counts),
    // combined with MRV selection (first cell with fewest remaining candidates > 1).
    let solvable = true;
    let bestIdx = -1;
    let bestLen = 10;

    for (let i = 0; i < 81; i++) {
      let d = stackBuf[base + i];
      if ((d & (d - 1)) === 0) {
        continue;
      }
      const r = ROW_OF[i];
      const c = COL_OF[i];
      const b = BOX_OF[i];
      d &= ~(rowFixed[r] | colFixed[c] | boxFixed[b]);
      if (d === 0) {
        solvable = false;
        break;
      }
      stackBuf[base + i] = d;
      if ((d & (d - 1)) === 0) {
        rowFixed[r] |= d;
        colFixed[c] |= d;
        boxFixed[b] |= d;
      } else {
        const len = POPCOUNT[d];
        if (len < bestLen) {
          bestLen = len;
          bestIdx = i;
        }
      }
    }

    if (!solvable) {
      sp--;
      continue;
    }

    if (bestIdx === -1) {
      return {
        sudoku: frameToSimpleSudoku(stackBuf, base),
        iterations,
        hitLimit: false,
      };
    }

    // 3. Branch on bestIdx in ascending candidate order (push descending so smallest pops first).
    let m = stackBuf[base + bestIdx];
    let count = 0;
    while (m !== 0) {
      const bit = m & -m;
      m ^= bit;
      branchBits[count++] = bit;
    }

    ensureStackCapacity(sp + count);
    for (let k = count - 2; k >= 0; k--) {
      sp++;
      const dst = sp * 81;
      stackBuf.copyWithin(dst, base, base + 81);
      stackBuf[dst + bestIdx] = branchBits[k];
    }
    stackBuf[base + bestIdx] = branchBits[count - 1];
  }

  return {
    sudoku: null,
    iterations: Infinity,
    hitLimit: false,
  };
}

function loadDomainGridToFrame(grid: DomainSudoku, base: number): void {
  for (let r = 0; r < 9; r++) {
    const row = grid[r];
    const rowBase = base + r * 9;
    for (let c = 0; c < 9; c++) {
      const domain = row[c];
      let mask = 0;
      for (let k = 0; k < domain.length; k++) {
        mask |= 1 << (domain[k] - 1);
      }
      stackBuf[rowBase + c] = mask;
    }
  }
}

/**
 * For more information see the paper
 * Rating and Generating Sudoku Puzzles Based On Constraint Satisfaction Problems
 * by Bahare Fatemi, Seyed Mehran Kazemi, Nazanin Mehrasa
 */
export function _solveGridAC3(
  stack: DomainSudoku[] = [],
  iterations: number,
): {
  sudoku: SimpleSudoku | null;
  iterations: number;
} {
  if (stack.length === 0) {
    return {sudoku: null, iterations: Infinity};
  }
  ensureStackCapacity(stack.length);
  // stack[0] is top of stack -> load in reverse order so stack[0] sits at sp = stack.length - 1.
  for (let i = 0; i < stack.length; i++) {
    loadDomainGridToFrame(stack[stack.length - 1 - i], i * 81);
  }
  const result = solveBitmaskStack(stack.length - 1, iterations);
  return {
    sudoku: result.sudoku,
    iterations: result.iterations,
  };
}

export function solve(grid: SimpleSudoku): {
  sudoku: SimpleSudoku | null;
  iterations: number;
} {
  for (let r = 0; r < 9; r++) {
    const row = grid[r];
    const rowBase = r * 9;
    for (let c = 0; c < 9; c++) {
      const val = row[c];
      stackBuf[rowBase + c] = val === 0 ? FULL_MASK : 1 << (val - 1);
    }
  }

  const result = solveBitmaskStack(0, 0);
  if (!result.hitLimit) {
    return {
      sudoku: result.sudoku,
      iterations: result.iterations,
    };
  }

  return solveBacktracking(grid);
}
