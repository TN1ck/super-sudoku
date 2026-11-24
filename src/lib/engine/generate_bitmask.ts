/**
 * Based on the paper:
 *
 * Rating and Generating Sudoku Puzzles Based On
 * Constraint Satisfaction Problems
 *
 * This method will use the AC3-Solver
 * to generate Sudokus with different difficulties
 * according to the amount of times the Solver
 * had to be called
 *
 * They derived the following needed iterations for each difficulty:
 *
 * Easy   - 6.234
 * Medium - 29.2093
 * Hard   - 98.2093
 * Evil   - 527.4318
 *
 * They used Sudokus from websudoku.com for their research. So I checked myself, and I got these numbers (see difficulties.test.ts):
 *
 * Easy   - 7
 * Medium - 19
 * Hard   - 33
 * Expert - 113
 *
 */

import {solve as solveAC3} from "./solverAC3_bitmask";
import {countSolutionsFlat, hasSolution, hasSolutionFlat, hasUniqueSolution} from "./solverBacktracking_bitmask";

import {cloneSudoku, SUDOKU_NUMBERS, SUDOKU_COORDINATES, SQUARE_TABLE} from "./utility";
import {DIFFICULTY, SimpleSudoku} from "./types";
import {sample, shuffle} from "./seededRandom";

export const DIFFICULTY_GOALS = {
  [DIFFICULTY.EASY]: 3,
  [DIFFICULTY.MEDIUM]: 20,
  [DIFFICULTY.HARD]: 50,
  [DIFFICULTY.EXPERT]: 200,
  [DIFFICULTY.EVIL]: 500,
};

export const DIFFICULTY_RANGES = {
  [DIFFICULTY.EASY]: [0, 7],
  [DIFFICULTY.MEDIUM]: [8, 20],
  [DIFFICULTY.HARD]: [20, 70],
  [DIFFICULTY.EXPERT]: [71, 299],
  [DIFFICULTY.EVIL]: [300, 10000],
};

const FULL_MASK = 0x1ff;
const BOX_OF = new Uint8Array(81);
for (let i = 0; i < 81; i++) {
  const r = (i / 9) | 0;
  const c = i % 9;
  BOX_OF[i] = ((r / 3) | 0) * 3 + ((c / 3) | 0);
}
const enhanceRowMask = new Uint16Array(9);
const enhanceColMask = new Uint16Array(9);
const enhanceBoxMask = new Uint16Array(9);

const sudokuSolver = solveAC3;
const checkUniqueSolution = hasUniqueSolution;

/**
 * Checks that there is only one solution for the sudoku.
 */
export function isSudokuUnique(sudoku: SimpleSudoku): boolean {
  return checkUniqueSolution(sudoku);
}

function sudokuToFlat(sudoku: SimpleSudoku): Uint8Array {
  const flat = new Uint8Array(81);
  for (let r = 0; r < 9; r++) {
    const row = sudoku[r];
    const base = r * 9;
    for (let c = 0; c < 9; c++) {
      flat[base + c] = row[c];
    }
  }
  return flat;
}

/**
 * Enhances the uniqueness of a sudoku in place (caller owns `sudoku` and `flat`).
 *
 * Whenever a number is encountered that would lead to two different solutions,
 * one number is set and true is returned.
 */
function enhanceUniquenessInPlace(
  sudoku: SimpleSudoku,
  flat: Uint8Array,
  sol1: Uint8Array,
  sol2: Uint8Array,
  randomFn: () => number,
): boolean {
  enhanceRowMask.fill(0);
  enhanceColMask.fill(0);
  enhanceBoxMask.fill(0);
  for (let i = 0; i < 81; i++) {
    const val = flat[i];
    if (val !== 0) {
      const bit = 1 << (val - 1);
      enhanceRowMask[(i / 9) | 0] |= bit;
      enhanceColMask[i % 9] |= bit;
      enhanceBoxMask[BOX_OF[i]] |= bit;
    }
  }

  const randomRows = randomIndexes(randomFn);
  for (const row of randomRows) {
    const randomColumns = randomIndexes(randomFn);
    const rowBase = row * 9;
    const rMask = enhanceRowMask[row];
    for (const col of randomColumns) {
      const idx = rowBase + col;
      if (flat[idx] !== 0) {
        continue;
      }

      const availMask = ~(rMask | enhanceColMask[col] | enhanceBoxMask[BOX_OF[idx]]) & FULL_MASK;
      // Need at least 2 legal candidates for this cell to be able to have 2 distinct solutions.
      if (availMask === 0 || (availMask & (availMask - 1)) === 0) {
        continue;
      }

      const known1 = sol1[idx];
      const known2 = sol2[idx];
      let timesSolved = 0;

      for (let candidate = 1; candidate <= 9; candidate++) {
        if ((availMask & (1 << (candidate - 1))) === 0) {
          continue;
        }
        let solvable: boolean;
        if (candidate === known1 || candidate === known2) {
          solvable = true;
        } else {
          flat[idx] = candidate;
          solvable = hasSolutionFlat(flat);
          flat[idx] = 0;
        }
        if (solvable) {
          timesSolved++;
          if (timesSolved > 1) {
            sudoku[row][col] = candidate;
            flat[idx] = candidate;
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Simplify the sudoku in place (caller owns `sudoku`).
 *
 * Basically set a number that is not set yet.
 */
function simplifySudokuInPlace(sudoku: SimpleSudoku, solvedFlat: Uint8Array, randomFn: () => number): boolean {
  const randomRows = randomIndexes(randomFn);
  for (const row of randomRows) {
    const randomColumns = randomIndexes(randomFn);
    const rowBase = row * 9;
    for (const column of randomColumns) {
      if (sudoku[row][column] === 0) {
        sudoku[row][column] = solvedFlat[rowBase + column];
        return true;
      }
    }
  }
  return false;
}

function generateCoordinateList(sudoku: SimpleSudoku): Array<[number, number]> {
  const coordinates: Array<[number, number]> = [];
  for (let row = 0; row < sudoku.length; row++) {
    for (let col = 0; col < sudoku[row].length; col++) {
      if (sudoku[row][col] !== 0) {
        coordinates.push([row, col]);
      }
    }
  }
  return coordinates;
}

function randomIndexes(randomFn: () => number) {
  return shuffle(SUDOKU_COORDINATES, randomFn);
}

function fixRows(sudoku: SimpleSudoku, randomFn: () => number) {
  const xIndexes = randomIndexes(randomFn);
  for (const x of xIndexes) {
    let seen = 0;
    const yIndexes = randomIndexes(randomFn);
    const row = sudoku[x];
    for (const y of yIndexes) {
      const number = row[y];
      if (number !== 0) {
        const bit = 1 << number;
        if ((seen & bit) !== 0) {
          row[y] = 0;
        } else {
          seen |= bit;
        }
      }
    }
  }
}

function fixColumns(sudoku: SimpleSudoku, randomFn: () => number) {
  const xIndexes = randomIndexes(randomFn);
  for (const x of xIndexes) {
    let seen = 0;
    const yIndexes = randomIndexes(randomFn);
    for (const y of yIndexes) {
      const number = sudoku[y][x];
      if (number !== 0) {
        const bit = 1 << number;
        if ((seen & bit) !== 0) {
          sudoku[y][x] = 0;
        } else {
          seen |= bit;
        }
      }
    }
  }
}

/**
 * Removes all numbers that make the sudoku invalid.
 */
function fixGrid(sudoku: SimpleSudoku, randomFn: () => number) {
  const indexes = randomIndexes(randomFn);
  for (let s = 0; s < 9; s++) {
    let seen = 0;
    const square = SQUARE_TABLE[s];
    for (const xy of indexes) {
      const [x, y] = square[xy];
      const number = sudoku[x][y];
      if (number !== 0) {
        const bit = 1 << number;
        if ((seen & bit) !== 0) {
          sudoku[x][y] = 0;
        } else {
          seen |= bit;
        }
      }
    }
  }
}

function fixSudoku(sudoku: SimpleSudoku, randomFn: () => number) {
  fixGrid(sudoku, randomFn);
  fixColumns(sudoku, randomFn);
  fixRows(sudoku, randomFn);
}

/**
 * Generate a random sudoku.
 */
function generateRandomSudoku(randomFn: () => number): SimpleSudoku {
  const randomSudoku = SUDOKU_NUMBERS.map(() =>
    shuffle(
      SUDOKU_NUMBERS.map((n) => (randomFn() > 0.8 ? n : 0)),
      randomFn,
    ),
  );
  fixSudoku(randomSudoku, randomFn);
  return randomSudoku;
}

const RELATIVE_DRIFT = 20;
// Needed for easy difficulty where low iteration counts make relative drift too strict.
const ABSOLUTE_DRIFT = 3;

function increaseDifficultyWithCost(
  sudoku: SimpleSudoku,
  costs: number,
  randomFn: () => number,
): {sudoku: SimpleSudoku; iterations: number; changed: boolean} {
  let coordinateList = generateCoordinateList(sudoku);
  const trial = cloneSudoku(sudoku);
  while (coordinateList.length > 0) {
    const [x, y] = sample(coordinateList, randomFn);
    coordinateList = coordinateList.filter(([cx, cy]) => cx !== x && cy !== y);
    const saved = trial[x][y];
    trial[x][y] = 0;
    // Check uniqueness first: fast bitmask search short-circuits non-unique removals before AC3 runs.
    if (isSudokuUnique(trial)) {
      const newCosts = sudokuSolver(trial).iterations;
      if (newCosts > costs) {
        return {sudoku: trial, iterations: newCosts, changed: true};
      }
    }
    trial[x][y] = saved;
  }
  return {sudoku, iterations: costs, changed: false};
}

export function increaseDifficultyOfSudoku(sudoku: SimpleSudoku, randomFn: () => number): SimpleSudoku {
  const costs = sudokuSolver(sudoku).iterations;
  return increaseDifficultyWithCost(sudoku, costs, randomFn).sudoku;
}

function createSolvableSudoku(randomFn: () => number): SimpleSudoku {
  const sudoku = generateRandomSudoku(randomFn);

  while (!hasSolution(sudoku)) {
    const randomX = sample(SUDOKU_COORDINATES, randomFn);
    const randomY = sample(SUDOKU_COORDINATES, randomFn);
    sudoku[randomX][randomY] = randomFn() > 0.8 ? sample(SUDOKU_NUMBERS, randomFn) : 0;
    fixSudoku(sudoku, randomFn);
  }

  return sudoku;
}

function makeSudokuUnique(sudoku: SimpleSudoku, randomFn: () => number): [SimpleSudoku, boolean, Uint8Array | null] {
  sudoku = cloneSudoku(sudoku);
  const flat = sudokuToFlat(sudoku);

  while (true) {
    const {count, firstFlat, secondFlat} = countSolutionsFlat(flat, 2);
    if (count === 1) {
      return [sudoku, true, firstFlat];
    }
    if (count === 0 || firstFlat === null || secondFlat === null) {
      return [sudoku, false, null];
    }
    if (!enhanceUniquenessInPlace(sudoku, flat, firstFlat, secondFlat, randomFn)) {
      return [sudoku, false, null];
    }
  }
}

export function generateSudoku(
  difficulty: DIFFICULTY,
  randomFn: () => number,
): {sudoku: SimpleSudoku; isInDifficultyRange: boolean; reachedMaxIterations: boolean; iterations: number} {
  const iterationGoal = DIFFICULTY_GOALS[difficulty];

  function rateIterationsRelative(cost: number): number {
    if (cost === Infinity) {
      return cost;
    }
    return Math.abs(cost / iterationGoal - 1) * 100;
  }

  function rateCostsAbsolute(cost: number): number {
    return Math.abs(cost - iterationGoal);
  }

  function validIterations(cost: number): boolean {
    return rateIterationsRelative(cost) < RELATIVE_DRIFT || rateCostsAbsolute(cost) < ABSOLUTE_DRIFT;
  }

  let unique = false;
  let sudoku: SimpleSudoku = [];
  let solvedFlat: Uint8Array | null = null;
  while (!unique) {
    // 1. Create a random, solvable sudoku.
    sudoku = createSolvableSudoku(randomFn);
    // 2. Make it unique.
    [sudoku, unique, solvedFlat] = makeSudokuUnique(sudoku, randomFn);
  }

  let currentIterations = sudokuSolver(sudoku).iterations;

  let reachedMaxIterations = false;
  while (!validIterations(currentIterations)) {
    let changed = false;
    let newIterations = currentIterations;
    // Too difficult, make it easier.
    if (currentIterations > iterationGoal) {
      changed = simplifySudokuInPlace(sudoku, solvedFlat!, randomFn);
      if (changed) {
        newIterations = sudokuSolver(sudoku).iterations;
      }
    } else if (currentIterations < iterationGoal) {
      // Too easy, make it more difficult.
      const harder = increaseDifficultyWithCost(sudoku, currentIterations, randomFn);
      sudoku = harder.sudoku;
      newIterations = harder.iterations;
      changed = harder.changed;
    }
    if (currentIterations === newIterations && !changed) {
      reachedMaxIterations = true;
      break;
    }
    currentIterations = newIterations;
  }

  const isInDifficultyRange =
    currentIterations >= DIFFICULTY_RANGES[difficulty][0] && currentIterations <= DIFFICULTY_RANGES[difficulty][1];
  return {sudoku, isInDifficultyRange, reachedMaxIterations, iterations: currentIterations};
}

export default generateSudoku;
