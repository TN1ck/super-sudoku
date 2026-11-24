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

import {solve as solveAC3} from "./solverAC3";
import {countSolutions} from "./solverBacktracking";

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

const sudokuSolver = solveAC3;

/**
 * Checks that there is only one solution for the sudoku.
 */
export function isSudokuUnique(sudoku: SimpleSudoku): boolean {
  return countSolutions(sudoku, 2).count === 1;
}

/**
 * Enhances the uniqueness of a sudoku.
 *
 * Whenever a number is encountered that would lead to two different solutions,
 * one number is set and the new sudoku is returned.
 *
 * When uniqueness could not be increased, returns the same sudoku.
 */
function enhanceUniqueness(sudoku: SimpleSudoku, randomFn: () => number): SimpleSudoku {
  const randomRows = randomIndexes(randomFn);
  for (const row of randomRows) {
    const randomColumns = randomIndexes(randomFn);
    for (const col of randomColumns) {
      const num = sudoku[row][col];
      // We hit a 0, that means we can check for how many sudoku numbers it could be solved.
      if (num === 0) {
        let timesSolved = 0;
        for (const candidate of SUDOKU_NUMBERS) {
          const newSudoku = cloneSudoku(sudoku);
          newSudoku[row][col] = candidate;

          const iterations = sudokuSolver(newSudoku).iterations;
          if (iterations !== Infinity) {
            timesSolved++;
            if (timesSolved > 1) {
              return newSudoku;
            }
          }
        }
      }
    }
  }
  return sudoku;
}

/**
 * Simplify the sudoku.
 *
 * Basically set a number that is not set yet.
 */
function simplifySudoku(sudoku: SimpleSudoku, randomFn: () => number): SimpleSudoku {
  const solvedSudoku = sudokuSolver(sudoku).sudoku;
  if (solvedSudoku === null) {
    throw new Error("Sudoku is not solvable.");
  }
  const randomRows = randomIndexes(randomFn);
  for (const row of randomRows) {
    const randomColumns = randomIndexes(randomFn);
    for (const column of randomColumns) {
      if (sudoku[row][column] === 0) {
        const newSudoku = cloneSudoku(sudoku);
        newSudoku[row][column] = solvedSudoku[row][column];
        return newSudoku;
      }
    }
  }
  return sudoku;
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
    const seen = new Set<number>();
    const yIndexes = randomIndexes(randomFn);
    for (const y of yIndexes) {
      const number = sudoku[x][y];
      if (number !== 0 && seen.has(number)) {
        sudoku[x][y] = 0;
      }
      seen.add(number);
    }
  }
}

function fixColumns(sudoku: SimpleSudoku, randomFn: () => number) {
  const xIndexes = randomIndexes(randomFn);
  for (const x of xIndexes) {
    const seen = new Set<number>();
    const yIndexes = randomIndexes(randomFn);
    for (const y of yIndexes) {
      const number = sudoku[y][x];
      if (number !== 0 && seen.has(number)) {
        sudoku[y][x] = 0;
      }
      seen.add(number);
    }
  }
}

/**
 * Removes all numbers that make the sudoku invalid.
 */
function fixGrid(sudoku: SimpleSudoku, randomFn: () => number) {
  const indexes = randomIndexes(randomFn);
  for (let s = 0; s < 9; s++) {
    const seen = new Set<number>();
    const square = SQUARE_TABLE[s];
    for (const xy of indexes) {
      const [x, y] = square[xy];
      const number = sudoku[x][y];
      if (number !== 0 && seen.has(number)) {
        sudoku[x][y] = 0;
      }
      seen.add(number);
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

export function increaseDifficultyOfSudoku(sudoku: SimpleSudoku, randomFn: () => number): SimpleSudoku {
  const costs = sudokuSolver(sudoku).iterations;
  let coordinateList = generateCoordinateList(sudoku);
  while (coordinateList.length > 0) {
    const [x, y] = sample(coordinateList, randomFn);
    coordinateList = coordinateList.filter(([cx, cy]) => cx !== x && cy !== y);
    const newSudoku = cloneSudoku(sudoku);
    newSudoku[x][y] = 0;
    const newCosts = sudokuSolver(newSudoku).iterations;
    if (newCosts > costs && isSudokuUnique(newSudoku)) {
      return newSudoku;
    }
  }
  return sudoku;
}

function createSolvableSudoku(randomFn: () => number): SimpleSudoku {
  const sudoku = generateRandomSudoku(randomFn);

  while (sudokuSolver(sudoku).iterations === Infinity) {
    const randomX = sample(SUDOKU_COORDINATES, randomFn);
    const randomY = sample(SUDOKU_COORDINATES, randomFn);
    sudoku[randomX][randomY] = randomFn() > 0.8 ? sample(SUDOKU_NUMBERS, randomFn) : 0;
    fixSudoku(sudoku, randomFn);
  }

  return sudoku;
}

function makeSudokuUnique(sudoku: SimpleSudoku, randomFn: () => number): [SimpleSudoku, boolean] {
  sudoku = cloneSudoku(sudoku);
  while (!isSudokuUnique(sudoku)) {
    const newBestSudoku = enhanceUniqueness(sudoku, randomFn);
    if (newBestSudoku === sudoku) {
      break;
    }
    sudoku = newBestSudoku;
  }

  return [sudoku, isSudokuUnique(sudoku)];
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
  while (!unique) {
    // 1. Create a random, solvable sudoku.
    sudoku = createSolvableSudoku(randomFn);
    // 2. Make it unique.
    [sudoku, unique] = makeSudokuUnique(sudoku, randomFn);
  }

  let currentIterations = sudokuSolver(sudoku).iterations;

  let reachedMaxIterations = false;
  while (!validIterations(currentIterations)) {
    let newSudoku: SimpleSudoku = sudoku;
    // Too difficult, make it easier.
    if (currentIterations > iterationGoal) {
      newSudoku = simplifySudoku(sudoku, randomFn);
    }
    // Too easy, make it more difficult.
    if (currentIterations < iterationGoal) {
      newSudoku = increaseDifficultyOfSudoku(sudoku, randomFn);
    }
    const newIterations = sudokuSolver(newSudoku).iterations;
    if (currentIterations === newIterations && newSudoku === sudoku) {
      reachedMaxIterations = true;
      break;
    }
    sudoku = newSudoku;
    currentIterations = newIterations;
  }

  const isInDifficultyRange =
    currentIterations >= DIFFICULTY_RANGES[difficulty][0] && currentIterations <= DIFFICULTY_RANGES[difficulty][1];
  return {sudoku, isInDifficultyRange, reachedMaxIterations, iterations: currentIterations};
}

export default generateSudoku;
