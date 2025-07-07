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
 * They used Sudokus from websudoku.com for their research. So I checked myself, and I got these numbers (see __tests__/difficulties.ts):
 *
 * Easy   - 7
 * Medium - 19
 * Hard   - 33
 * Expert - 113
 *
 */

import {solve, solve as solveAC3} from "./solverAC3";

import {SUDOKU_NUMBERS, SUDOKU_COORDINATES, SQUARE_TABLE} from "./utility";
import {DIFFICULTY, SimpleSudoku} from "./types";
import flatten from "lodash/flatten";
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
 *
 * This works by iterating over all cells and if an empty one is encountered,
 * we set numbers from 1-9 and make sure that only one yields a solution.
 * This is a very expensive operation as it needs to solve at maximum about 9 * 9 * 9 = 729 sudokus.
 */
export function isSudokuUnique(sudoku: SimpleSudoku): boolean {
  let rowIndex = 0;
  for (const row of sudoku) {
    let colIndex = 0;
    for (const col of row) {
      // if it's 0, we try every number and if it's still solvable
      // with two different numbers it's not unique
      if (col === 0) {
        let timesSolved = 0;
        for (const num of SUDOKU_NUMBERS) {
          const newSudoku = cloneSudoku(sudoku);
          newSudoku[rowIndex][colIndex] = num;

          const iterations = solve(newSudoku).iterations;
          if (iterations !== Infinity) {
            timesSolved++;
          }
        }
        if (timesSolved > 1) {
          return false;
        }
      }
      colIndex++;
    }
    rowIndex++;
  }
  return true;
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
        for (const num of SUDOKU_NUMBERS) {
          const newSudoku = cloneSudoku(sudoku);
          newSudoku[row][col] = num;

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

const isCoordinate = (item: number[] | undefined): item is number[] => {
  return item !== undefined;
};

function generateCoordinateList(sudoku: SimpleSudoku): number[][] {
  const coordinates = sudoku.map((row, i) => {
    return row.map((n, c) => (n !== 0 ? [i, c] : undefined));
  });
  const coordinatesWithNumbers = flatten(coordinates).filter(isCoordinate);
  return coordinatesWithNumbers;
}

function randomIndexes(randomFn: () => number) {
  return shuffle(SUDOKU_COORDINATES, randomFn);
}

function fixRows(sudoku: SimpleSudoku, randomFn: () => number) {
  const xIndexes = randomIndexes(randomFn);
  for (let x of xIndexes) {
    const wrongNumbers = Array(9).map(() => false);
    const yIndexes = randomIndexes(randomFn);
    for (let y of yIndexes) {
      const number = sudoku[x][y];
      if (number !== 0 && wrongNumbers[number]) {
        sudoku[x][y] = 0;
      }
      wrongNumbers[number] = true;
    }
  }
}

function fixColumns(sudoku: SimpleSudoku, randomFn: () => number) {
  const xIndexes = randomIndexes(randomFn);
  for (let x of xIndexes) {
    const wrongNumbers = Array(9).map(() => false);
    const yIndexes = randomIndexes(randomFn);
    for (let y of yIndexes) {
      const number = sudoku[y][x];
      if (number !== 0 && wrongNumbers[number]) {
        sudoku[y][x] = 0;
      }
      wrongNumbers[number] = true;
    }
  }
}

/**
 * Removes all numbers that make the sudoku invalid.
 */
function fixGrid(sudoku: SimpleSudoku, randomFn: () => number) {
  const indexes = randomIndexes(randomFn);
  for (let s = 0; s < 9; s++) {
    const wrongNumbers = Array(9).map(() => false);
    const square = SQUARE_TABLE[s];
    for (let xy of indexes) {
      const [x, y] = square[xy];
      const number = sudoku[x][y];
      if (number !== 0 && wrongNumbers[number]) {
        sudoku[x][y] = 0;
      }
      wrongNumbers[number] = true;
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
  const randomSudoku = SUDOKU_NUMBERS.map(() => {
    return shuffle(
      SUDOKU_NUMBERS.map((n) => {
        return randomFn() > 0.8 ? n : 0;
      }),
      randomFn,
    );
  });
  fixSudoku(randomSudoku, randomFn);
  return randomSudoku;
}

function cloneSudoku(sudoku: SimpleSudoku): SimpleSudoku {
  return [...sudoku.map((r) => [...r])];
}

const RELATIVE_DRIFT = 20;
// this is mostly needed for the esay difficulty, because the iterations needed there
// are too low that the relative drift would do anything
const ABSOLUTE_DRIFT = 3;

export function increaseDifficultyOfSudoku(sudoku: SimpleSudoku, randomFn: () => number): SimpleSudoku {
  const costs = sudokuSolver(sudoku).iterations;
  let coordinateList = generateCoordinateList(sudoku);
  while (coordinateList.length > 0) {
    const sampleXY = sample(coordinateList, randomFn);
    const [x, y] = sampleXY;
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
  let sudoku = generateRandomSudoku(randomFn);

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
    if (newBestSudoku === undefined) {
      console.log("Max uniqueness reached");
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

  /**
   * returns the percentage of how close we are to the iteration goal
   */
  function rateIterationsRelative(cost: number): number {
    if (cost === Infinity) {
      return cost;
    }
    return Math.abs(cost / iterationGoal - 1) * 100;
  }

  /**
   * returns the absolute difference to the iteration goal
   */
  function rateCostsAbsolute(cost: number): number {
    return Math.abs(cost - iterationGoal);
  }

  /**
   * returns if the costs are close enough to the requested difficulty level
   */
  function validIterations(cost: number): boolean {
    return rateIterationsRelative(cost) < RELATIVE_DRIFT || rateCostsAbsolute(cost) < ABSOLUTE_DRIFT;
  }

  let unique = false;
  let sudoku: SimpleSudoku = [];
  while (!unique) {
    // 1. create a random, solvable sudoku.
    sudoku = createSolvableSudoku(randomFn);
    // 2. make it unique.
    [sudoku, unique] = makeSudokuUnique(sudoku, randomFn);
  }

  let currentIterations = sudokuSolver(sudoku).iterations;

  let reachedMaxIterations = false;
  while (!validIterations(currentIterations)) {
    let newSudoku: SimpleSudoku = [];
    // Too difficult, make it easier.
    if (currentIterations > iterationGoal) {
      newSudoku = simplifySudoku(sudoku, randomFn);
    }
    // Too easy, make it more difficult.
    if (currentIterations < iterationGoal) {
      newSudoku = increaseDifficultyOfSudoku(sudoku, randomFn);
    }
    const newIterations = sudokuSolver(newSudoku).iterations;
    if (currentIterations === newIterations) {
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
