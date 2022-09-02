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

import _, * as lodash from "lodash";
import * as solverAC3 from "./solverAC3";
import * as solverOptimized from "./solverOptimized";

import {SUDOKU_NUMBERS, SUDOKU_COORDINATES, printSimpleSudoku, SQUARE_TABLE} from "./utility";
import {DIFFICULTY, SimpleSudoku} from "./types";

const DIFFICULTY_MAPPING = {
  [DIFFICULTY.EASY]: 2,
  [DIFFICULTY.MEDIUM]: 20,
  [DIFFICULTY.HARD]: 50,
  [DIFFICULTY.EXPERT]: 200,
  [DIFFICULTY.EVIL]: 500,
};

const sudokuSolver = solverAC3.solve;

/**
 * The cost function is rather simple
 * It takes a sudoku and returns the cost, which is calculated like this:
 * if solvable - return the iterations needed to solve it
 * if not solvable - return infinity
 */
function costFunction(sudoku: SimpleSudoku): number {
  const result = sudokuSolver(sudoku);
  if (result.iterations < Infinity) {
    return checkForUniqueness(sudoku) ? result.iterations : Infinity;
  }
  return result.iterations;
}

function costFunctionSimple(sudoku: SimpleSudoku): number {
  return sudokuSolver(sudoku).iterations;
}

function getRandomSudokuNumber(): number {
  return lodash.random(10) > 8 ? lodash.random(1, 9) : 0;
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

          const iterations = costFunctionSimple(newSudoku);
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
  const solvedSudoku = sudokuSolver(sudoku);
  const randomRows = randomIndexes();
  const newSudoku = cloneSudoku(sudoku);
  for (const row of randomRows) {
    const randomColumns = randomIndexes();
    for (const column of randomColumns) {
      if (newSudoku[row][column] === 0) {
        newSudoku[row][column] = solvedSudoku[row][column];
      }
    }
  }
  return newSudoku;
}

/**
 * Enhances the uniqueness of a sudoku.
 *
 * Whenever a number is encountered that would lead to two different solution,
 * one number is set and the new sudoku is returned.
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

          const iterations = costFunctionSimple(newSudoku);
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
  const coordinatesWithNumbers = lodash.flatten(coordinates).filter((c) => c !== undefined);
  return coordinatesWithNumbers;
}

function randomSudokuIndex() {
  return _.sample(SUDOKU_COORDINATES);
}

function randomIndexes() {
  return _.shuffle(SUDOKU_COORDINATES);
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
    return lodash.shuffle(
      SUDOKU_NUMBERS.map((n) => {
        return lodash.random(10) > 8 ? n : 0;
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

export function generateSudoku(difficulty: DIFFICULTY): SimpleSudoku {
  const iterationGoal = DIFFICULTY_MAPPING[difficulty];

  /**
   * returns the percentage of how close we are to the iteration goal
   */
  function rateCostsPercentage(cost: number): number {
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
  function validCosts(cost: number): boolean {
    return rateCostsPercentage(cost) < RELATIVE_DRIFT || rateCostsAbsolute(cost) < ABSOLUTE_DRIFT;
  }

  // 1. create a random sudoku
  const randomSudoku = generateRandomSudoku();

  let bestSudoku = randomSudoku;
  let bestCost = costFunction(bestSudoku);
  let coordinateList: number[][] = [];

  /**
   * Check if sudoku is unique and has valid costs
   */
  function isFinished(sudoku, cost) {
    if (!validCosts(cost)) {
      return false;
    }
    if (!checkForUniqueness(sudoku)) {
      return false;
    }
    return true;
  }

  // TODO: Split this into 2 steps, first we generate a valid sudoku and then we change its difficulty.
  while (!isFinished(bestSudoku, bestCost)) {
    // clone the bestSudoku
    const newSudoku = cloneSudoku(bestSudoku);

    // Make the sudoku and apply the cost function.
    if (bestCost > iterationGoal) {
      const randomX = randomSudokuIndex();
      const randomY = randomSudokuIndex();
      newSudoku[randomX][randomY] = getRandomSudokuNumber();
      fixSudoku(newSudoku);
    } else {
      // we can be a bit more specific to speed up the generation
      if (coordinateList.length === 0) {
        console.log("we tried everything with this version, it is at maximum difficulty");
        console.log(`Needed ${bestCost} to generate this sudoku. Goal was ${iterationGoal}.`);
        return bestSudoku;
      }
      const sample = lodash.sample(coordinateList);
      coordinateList = coordinateList.filter((d) => d !== sample);
      const [x, y] = sample;
      newSudoku[x][y] = 0;
    }

    // If the current sudoku is not solvable or the
    // the costs are higher than from the new, we set the new one as the new best one
    // this is the hill climbing part.
    if (bestCost === Infinity) {
      const newCostSimple = costFunctionSimple(newSudoku);
      if (newCostSimple < Infinity) {
        bestSudoku = newSudoku;
        while (!checkForUniqueness(bestSudoku)) {
          const newBestSudoku = enhanceUniqueness(bestSudoku);
          if (newBestSudoku === bestSudoku) {
            console.log("Max uniqueness reached");
            break;
          }
          bestSudoku = newBestSudoku;
          bestCost = costFunctionSimple(bestSudoku);
        }
      }
      coordinateList = generateCoordinateList(newSudoku);
    } else {
      const newCost = costFunction(newSudoku);
      if (rateCostsAbsolute(newCost) < rateCostsAbsolute(bestCost)) {
        bestSudoku = newSudoku;
        bestCost = newCost;
        coordinateList = generateCoordinateList(newSudoku);
      }
    }
  }
  console.log(`Needed ${bestCost} to generate this sudoku. Goal was ${iterationGoal}.`);
  return bestSudoku;
}

export default generateSudoku;
