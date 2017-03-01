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
import {
    SQUARE_TABLE,
    SUDOKU_NUMBERS,
    DomainSudoku,
    SimpleSudoku,
    squareIndex
} from './utility';



const DIFFICULTY_MAPPING = {
    easy: 6.234,
    medium: 29.2093,
    hard: 98.2093,
    evil: 527.4318
};

/**
 * The cost function is rather SimpleSudoku
 * It takes a soduku and returns the cost, which is calculated like this:
 * if solveable - return the iterations needed to solve it
 * if not solveable - return infinity
 */
function costFunction (sudoku: SimpleSudoku) {
    const result = solverAC3.solve(sudoku);
    return result.iterations;
}

function getRandomSudokuNumber () : number {
    return (_.random(10) > 7) ? _.random(1, 9) :  undefined;
}

function generateSudoku (difficulty): SimpleSudoku {

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
    while (rateCosts(bestCost) > 10) {
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
        let newCost = costFunction(newSudoku)
        // hillclimbing
        if (rateCosts(bestCost) === Infinity || rateCosts(newCost) < rateCosts(bestCost)) {
            bestSudoku = newSudoku;
            bestCost = newCost;
        }
    }

    return bestSudoku;
}

export default generateSudoku;


