/**
 * Based on the paper:
 *
 * Rating and Generating Sudoku Puzzles Based On
 * Constraint Satisfaction Problems
 *
 * This method will use hte AC3-Solver
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

import * as lodash from "lodash";
import * as solverAC3 from "./solverAC3";

import {SUDOKU_NUMBERS, SUDOKU_COORDINATES} from "./utility";
import {DIFFICULTY, SimpleSudoku} from "./types";

const DIFFICULTY_MAPPING = {
  [DIFFICULTY.EASY]: 6.234,
  [DIFFICULTY.MEDIUM]: 29.2093,
  [DIFFICULTY.HARD]: 98.2093,
  [DIFFICULTY.EVIL]: 527.4318,
  // [DIFFICULTY.EVIL]: 1500,
};

/**
 * The cost function is rather simple
 * It takes a soduku and returns the cost, which is calculated like this:
 * if solveable - return the iterations needed to solve it
 * if not solveable - return infinity
 */
function costFunction(sudoku: SimpleSudoku): number {
  const result = solverAC3.solve(sudoku);
  if (result.iterations < Infinity) {
    return checkForUniqueness(sudoku) ? result.iterations : Infinity;
  }
  return result.iterations;
}

function costFunctionSimple(sudoku: SimpleSudoku): number {
  return solverAC3.solve(sudoku).iterations;
}

function getRandomSudokuNumber(): number {
  return lodash.random(10) > 8 ? lodash.random(1, 9) : undefined;
}

export function checkForUniqueness(sudoku: SimpleSudoku): boolean {
  let rowIndex = 0;
  for (const row of sudoku) {
    let colIndex = 0;
    for (const col of row) {
      // if it's undefined, we try every number and if it's still solveable
      // with two different numbers it's not unique
      if (col === undefined) {
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

          const result = solverAC3.solve(newSudoku);
          if (result.iterations !== Infinity) {
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

function enhanceUniqueness(sudoku: SimpleSudoku): SimpleSudoku {
  const randomRows = lodash.shuffle(SUDOKU_COORDINATES);
  for (const row of randomRows) {
    const randomColumns = lodash.shuffle(SUDOKU_COORDINATES);
    for (const col of randomColumns) {
      const num = sudoku[row][col];
      if (num === undefined) {
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

          const result = solverAC3.solve(newSudoku);
          if (result.iterations !== Infinity) {
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
    return row.map((n, c) => (n !== undefined ? [i, c] : undefined));
  });
  const coordinatesWithNumbers = lodash.flatten(coordinates).filter(c => c !== undefined);
  return coordinatesWithNumbers;
}

const RELATIVE_DRIFT = 20;
// this is mostly needed for the esay difficulty, because the iterations needed there
// are too low that the relative drift would do anything
const ABSOLUTE_DRIFT = 5;

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
  const randomSudoku: SimpleSudoku = SUDOKU_NUMBERS.map(() => {
    return SUDOKU_NUMBERS.map(() => {
      return getRandomSudokuNumber();
    });
  });

  let bestSudoku = randomSudoku;
  let bestCost = costFunction(bestSudoku);
  let coordinateList = [];

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

  while (!isFinished(bestSudoku, bestCost)) {
    // clone the bestSudoku
    const newSudoku = [...bestSudoku.map(r => [...r])];

    // make the sudoku and apply the cost function
    if (bestCost > iterationGoal) {
      const randomX = lodash.random(0, 8);
      const randomY = lodash.random(0, 8);
      newSudoku[randomX][randomY] = getRandomSudokuNumber();
    } else {
      // we can be a bit more specific to speed up the generation
      if (coordinateList.length === 0) {
        console.log("we tried everything with this version, it is at maximum difficulty");
        console.log(`Needed ${bestCost} to generate this sudoku. Goal was ${iterationGoal}.`);
        return bestSudoku;
      }
      const sample = lodash.sample(coordinateList);
      coordinateList = coordinateList.filter(d => d !== sample);
      const [x, y] = sample;
      // console.log(`set ${x}/${y} to undefined`);
      newSudoku[x][y] = undefined;
    }

    // if the current sudoku is not solveable or the
    // the costs are higher that from the new, we set the new one as the new best one
    // this is the hill climbing part
    if (bestCost === Infinity) {
      const newCostSimple = costFunctionSimple(newSudoku);
      const isNewUnique = newCostSimple < Infinity && checkForUniqueness(newSudoku);
      if (newCostSimple < Infinity && !isNewUnique) {
        bestSudoku = enhanceUniqueness(newSudoku);
        bestCost = costFunction(bestSudoku);
      } else {
        bestSudoku = newSudoku;
        bestCost = isNewUnique ? newCostSimple : Infinity;
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
