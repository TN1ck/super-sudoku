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

import * as _ from 'lodash';
import * as solverAC3 from './solverAC3';
import * as solverOptimized from './solverOptimized';
import {
    SUDOKU_NUMBERS,
    SUDOKU_COORDINATES,
    SimpleSudoku,
} from './utility';

export enum DIFFICULTY {
    EASY,
    MEDIUM,
    HARD,
    EVIL
};

const DIFFICULTY_MAPPING = {
    [DIFFICULTY.EASY]: 6.234,
    [DIFFICULTY.MEDIUM]: 29.2093,
    [DIFFICULTY.HARD]: 98.2093,
    [DIFFICULTY.EVIL]: 527.4318
};

/**
 * The cost function is rather SimpleSudoku
 * It takes a soduku and returns the cost, which is calculated like this:
 * if solveable - return the iterations needed to solve it
 * if not solveable - return infinity
 */
function costFunction (sudoku: SimpleSudoku) : number {
    const resultFast = solverOptimized.solve(sudoku);
    if (resultFast.iterations === Infinity) {
        return resultFast.iterations;
    }
    const result = solverAC3.solve(sudoku);
    return result.iterations;
}

function getRandomSudokuNumber () : number {
    return (_.random(10) > 8) ? _.random(1, 9) :  undefined;
}

export function checkForUniqueness (sudoku: SimpleSudoku) : boolean {
    let rowIndex = 0;
    for (let row of sudoku) {
        let colIndex = 0;
        for (let col of row) {
            // if it's undefined, we try every number and if it's still solveable
            // with two different numbers it's not unique
            if (col === undefined) {
                let timesSolved = 0;
                for (let num of SUDOKU_NUMBERS) {
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

function enhanceUniqueness (sudoku: SimpleSudoku) : SimpleSudoku {
    const randomRows = _.shuffle(SUDOKU_COORDINATES);
    for (let row of randomRows) {
        const randomColumns = _.shuffle(SUDOKU_COORDINATES);
        for (let col of randomColumns) {
            const num = sudoku[row][col];
            if (num === undefined) {
                let timesSolved = 0;
                for (let num of SUDOKU_NUMBERS) {
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

export function generateSudoku (difficulty: DIFFICULTY): SimpleSudoku {

    const iterationGoal = DIFFICULTY_MAPPING[difficulty];

    function rateCosts (cost) {
        return Math.abs(cost - iterationGoal);
    }

    // 1. create a random sudoku
    const randomSudoku : SimpleSudoku = SUDOKU_NUMBERS.map(row => {
        return SUDOKU_NUMBERS.map(col => {
            return getRandomSudokuNumber();
        });
    });

    let bestSudoku = randomSudoku;
    let bestCost = costFunction(bestSudoku);
    let iterations = 0;

    function isFinished (sudoku, cost) {
        if (rateCosts(cost) > 10) {
            return false;
        }
        if (!checkForUniqueness(sudoku)) {
            console.log('Not unique!');
            return false;
        }
        return true;
    }

    while (!isFinished(bestSudoku, bestCost)) {
        iterations++;
        let numberOfNumbers = 0;
        for (let row of bestSudoku) {
            for (let col of row) {
                if (col) {
                    numberOfNumbers++;
                }
            }
        }
        console.log(iterations, numberOfNumbers);
        let newSudoku = [].concat(bestSudoku.map(row => {
            return [].concat(row);
        }));
        newSudoku[_.random(0, 8)][_.random(0, 8)] = getRandomSudokuNumber();
        let newCost = costFunction(newSudoku);
        // hillclimbing
        if (rateCosts(bestCost) === Infinity || rateCosts(newCost) < rateCosts(bestCost)) {
            bestSudoku = newSudoku;
            bestCost = newCost;
        }

        if (rateCosts(bestCost) < 10) {
            if (!checkForUniqueness(bestSudoku)) {
                bestSudoku = enhanceUniqueness(bestSudoku);
                console.log('cost before/after', bestCost, costFunction(bestSudoku));
            }
        }
    }

    return bestSudoku;
}

export default generateSudoku;


