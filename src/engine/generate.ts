/**
 * Based on the paper:
 *
 * Rating and Generating Sudoku Puzzles Based On
 * Constraint Satisfaction Problems
 *
 * This method will use the AC3-Solver
 * to generate sudokus with different difficulties
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
 */

import * as solverAC3 from "./solverAC3";
import * as solverOptimized from "./solverOptimized";

import {SUDOKU_NUMBERS, SUDOKU_COORDINATES, printSimpleSudoku, SQUARE_TABLE} from "./utility";
import {DIFFICULTY, SimpleSudoku} from "./types";
import { flatten, random, sample, shuffle } from "lodash";

const DIFFICULTY_MAPPING = {
  [DIFFICULTY.EASY]: 3,
  [DIFFICULTY.MEDIUM]: 20,
  [DIFFICULTY.HARD]: 50,
  [DIFFICULTY.EXPERT]: 200,
  [DIFFICULTY.EVIL]: 500,
};

const sudokuSolver = solverAC3.solve;

function getRandomSudokuNumber(): number {
  return random(10) > 8 ? random(1, 9) : 0;
}

/**
 * Checks that there is only one solution for the sudoku.
 *
 * This works by iterating over all cells and if an empty one is encountered,
 * we set numbers from 1-9 and make sure that only one yields a solution.
 */
export function checkForUniqueness(sudoku: SimpleSudoku): boolean {
  let rowIndex = 0;
  for (const row of sudoku) {
    let colIndex = 0;
    for (const col of row) {
      // if it's 0, we try every number and if it's still solveable
      // with two different numbers it's not unique
      if (col === 0) {
        let timesSolved = 0;
        for (const num of SUDOKU_NUMBERS) {
          const newSudoku = sudoku.map((r, ri) => {
            return r.map((c, ci) => {
              if (rowIndex === ri && colIndex === ci) {
                return num;
              }
              return c;
            });
          });

          const iterations = sudokuSolver(newSudoku).iterations;
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
 * Simplify the sudoku.
 *
 * Basically set a number that is not set yet.
 */
function simplifySudoku(sudoku: SimpleSudoku): SimpleSudoku {
  const solvedSudoku = sudokuSolver(sudoku).sudoku;
  const randomRows = randomIndexes();
  for (const row of randomRows) {
    const randomColumns = randomIndexes();
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

/**
 * Enhances the uniqueness of a sudoku.
 *
 * Whenever a number is encountered that would lead to two different solution,
 * one number is set and the new sudoku is returned.
 *
 * When uniqueness could not be increased, returns the same sudoku.
 */
function enhanceUniqueness(sudoku: SimpleSudoku): SimpleSudoku {
  const randomRows = randomIndexes();
  for (const row of randomRows) {
    const randomColumns = randomIndexes();
    for (const col of randomColumns) {
      const num = sudoku[row][col];
      if (num === 0) {
        let timesSolved = 0;
        for (const num of SUDOKU_NUMBERS) {
          const newSudoku = sudoku.map((r, ri) => {
            return r.map((c, ci) => {
              if (row === ri && col === ci) {
                return num;
              }
              return c;
            });
          });

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

function generateCoordinateList(sudoku: SimpleSudoku) {
  const coordinates = sudoku.map((row, i) => {
    return row.map((n, c) => (n !== 0 ? [i, c] : undefined));
  });
  const coordinatesWithNumbers = flatten(coordinates).filter((c) => c !== undefined);
  return coordinatesWithNumbers;
}

function randomSudokuIndex() {
  return sample(SUDOKU_COORDINATES);
}

function randomIndexes() {
  return shuffle(SUDOKU_COORDINATES);
}

function fixRows(sudoku: SimpleSudoku) {
  const xIndexes = randomIndexes();
  for (let x of xIndexes) {
    const wrongNumbers = Array(9).map(() => false);
    const yIndexes = randomIndexes();
    for (let y of yIndexes) {
      const number = sudoku[x][y];
      if (number !== 0 && wrongNumbers[number]) {
        sudoku[x][y] = 0;
      }
      wrongNumbers[number] = true;
    }
  }
}

function fixColumns(sudoku: SimpleSudoku) {
  const xIndexes = randomIndexes();
  for (let x of xIndexes) {
    const wrongNumbers = Array(9).map(() => false);
    const yIndexes = randomIndexes();
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
function fixGrid(sudoku: SimpleSudoku) {
  const indexes = randomIndexes();
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

function fixSudoku(sudoku: SimpleSudoku) {
  fixGrid(sudoku);
  fixColumns(sudoku);
  fixRows(sudoku);
}

/**
 * Generate a random sudoku.
 */
function generateRandomSudoku(): SimpleSudoku {
  const randomSudoku = SUDOKU_NUMBERS.map(() => {
    return shuffle(
      SUDOKU_NUMBERS.map((n) => {
        return random(10) > 8 ? n : 0;
      }),
    );
  });
  fixSudoku(randomSudoku);
  return randomSudoku;
}

function cloneSudoku(sudoku: SimpleSudoku): SimpleSudoku {
  return [...sudoku.map((r) => [...r])];
}

const RELATIVE_DRIFT = 20;
// this is mostly needed for the esay difficulty, because the iterations needed there
// are too low that the relative drift would do anything
const ABSOLUTE_DRIFT = 3;

export function increaseDifficultyOfSudoku(sudoku: SimpleSudoku): SimpleSudoku {
  const costs = sudokuSolver(sudoku).iterations;
  let coordinateList = generateCoordinateList(sudoku);
  while (coordinateList.length > 0) {
    const sampleXY = sample(coordinateList);
    const [x, y] = sampleXY;
    coordinateList = coordinateList.filter(([cx, cy]) => cx !== x && cy !== y);
    const newSudoku = cloneSudoku(sudoku);
    newSudoku[x][y] = 0;
    const newCosts = sudokuSolver(newSudoku).iterations;
    if (newCosts > costs && checkForUniqueness(newSudoku)) {
      return newSudoku;
    }
  }
  return sudoku;
}

function createSolvableSudoku(): SimpleSudoku {
  let sudoku = generateRandomSudoku();

  while (sudokuSolver(sudoku).iterations === Infinity) {
    const randomX = randomSudokuIndex();
    const randomY = randomSudokuIndex();
    sudoku[randomX][randomY] = getRandomSudokuNumber();
    fixSudoku(sudoku);
  }

  return sudoku;
}

function makeSudokuUnique(sudoku: SimpleSudoku): [SimpleSudoku, boolean] {
  sudoku = cloneSudoku(sudoku);
  while (!checkForUniqueness(sudoku)) {
    const newBestSudoku = enhanceUniqueness(sudoku);
    if (newBestSudoku === undefined) {
      console.log("Max uniqueness reached");
      break;
    }
    sudoku = newBestSudoku;
  }

  return [sudoku, checkForUniqueness(sudoku)];
}

export function generateSudoku(difficulty: DIFFICULTY): SimpleSudoku {
  const iterationGoal = DIFFICULTY_MAPPING[difficulty];

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
  let sudoku: SimpleSudoku;
  while (!unique) {
    // 1. create a random, solvable sudoku.
    sudoku = createSolvableSudoku();
    // 2. make it unique.
    [sudoku, unique] = makeSudokuUnique(sudoku);
  }

  let currentIterations = sudokuSolver(sudoku).iterations;
  while (!validIterations(currentIterations)) {
    let newSudoku: SimpleSudoku;
    // Too difficult, make it easier.
    if (currentIterations > iterationGoal) {
      newSudoku = simplifySudoku(sudoku);
    }
    // Too easy, make it more difficult.
    if (currentIterations < iterationGoal) {
      newSudoku = increaseDifficultyOfSudoku(sudoku);
    }
    const newIterations = sudokuSolver(newSudoku).iterations;
    if (currentIterations === newIterations) {
      console.log("Reached maximum simplicity / difficulty with this sudoku.");
      break;
    }
    sudoku = newSudoku;
    currentIterations = newIterations;
  }
  console.log(`Needed ${currentIterations} to generate this sudoku. Goal was ${iterationGoal}.`);
  return sudoku;
}

export default generateSudoku;
