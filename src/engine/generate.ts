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

import * as lodash from 'lodash';
import * as solverAC3 from './solverAC3';
import * as solverOptimized from './solverOptimized';
import {
  SUDOKU_NUMBERS,
  SUDOKU_COORDINATES,
  DIFFICULTY,
  SimpleSudoku,
} from './utility';

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
  const resultFast = solverAC3.solve(sudoku);
  if (resultFast.iterations === Infinity) {
    return resultFast.iterations;
  }
  const result = solverAC3.solve(sudoku);
  return result.iterations;
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

          const result = solverOptimized.solve(newSudoku);
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

          const result = solverOptimized.solve(newSudoku);
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
    return (
      rateCostsPercentage(cost) < RELATIVE_DRIFT ||
      rateCostsAbsolute(cost) < ABSOLUTE_DRIFT
    );
  }

  // 1. create a random sudoku
  const randomSudoku: SimpleSudoku = SUDOKU_NUMBERS.map(() => {
    return SUDOKU_NUMBERS.map(() => {
      return getRandomSudokuNumber();
    });
  });

  let bestSudoku = randomSudoku;
  let bestCost = costFunction(bestSudoku);

  function isFinished(sudoku, cost) {
    if (!validCosts(cost)) {
      return false;
    }
    if (!checkForUniqueness(sudoku)) {
      // console.log('Not unique!');
      return false;
    }
    return true;
  }

  // let iterations = 0;
  while (!isFinished(bestSudoku, bestCost)) {

    // iterations++;
    // let numberOfNumbers = 0;
    // for (const row of bestSudoku) {
    //   for (const col of row) {
    //     if (col) {
    //       numberOfNumbers++;
    //     }
    //   }
    // }

    const newSudoku = [].concat(
      bestSudoku.map(row => {
        return [].concat(row);
      }),
    );
    newSudoku[lodash.random(0, 8)][lodash.random(0, 8)] = getRandomSudokuNumber();
    const newCost = costFunction(newSudoku);

    // hillclimbing
    if (
      rateCostsAbsolute(bestCost) === Infinity ||
      rateCostsAbsolute(newCost) < rateCostsAbsolute(bestCost)
    ) {
      bestSudoku = newSudoku;
      bestCost = newCost;
    }

    // console.log(bestCost, newCost, validCosts(bestCost));

    if (validCosts(bestCost)) {
      if (!checkForUniqueness(bestSudoku)) {
        bestSudoku = enhanceUniqueness(bestSudoku);
        // console.log('cost before/after', bestCost, costFunction(bestSudoku));
      }
    }
  }
  console.log(`Needed ${bestCost} to generate this sudoku. Goal was ${iterationGoal}.`);
  return bestSudoku;
}

export default generateSudoku;
