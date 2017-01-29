import * as _ from 'lodash';
import {
    SQUARE_TABLE,
    SUDOKU_NUMBERS,
    DomainSudoku,
    SimpleSudoku,
    squareIndex
} from './utility';

function removeValuesFromDomain (domain1: Array<number>, domain2: Array<number>): [Array<number>, boolean] {
    let change = false;
    // this is an optimizitation:
    // AC3 checks if there is a value in domain1 that
    // does not comply the constraint with at least one value in domain2.
    // But because the contraint is inequality, the case happens only
    // when the domain2 is just one variable. The <= is just a safe-check.
    if (domain2.length <= 1) {
        const index = domain1.indexOf(domain2[0]);
        if (index !== -1) {
            domain1 = [].concat(domain1);
            domain1.splice(index, 1);
            change = true;
        }
    }
    return [domain1, change];
}

function toSimpeSudoku (grid: DomainSudoku) : SimpleSudoku {
    return grid.map(row => {
        return row.map(cells => {
            return cells.length === 1 ? cells[0] : undefined;
        });
    });
}

function toDomainSudoku (grid: SimpleSudoku) : DomainSudoku {
    return grid.map(row => {
        return row.map(c => {
            return (c === undefined) ? SUDOKU_NUMBERS : [c];
        });
    });
}

/**
 * For more information see the paper
 * Rating and Generating Sudoku Puzzles Based On Constraint Satisfaction Problems
 * by Bahare Fatemi, Seyed Mehran Kazemi, Nazanin Mehrasa
 */
export function _solveGridAC3 (stack: Array<DomainSudoku> = [], counter: number) : SimpleSudoku {
    if (stack.length === 0) {
        console.log('EMPTY STACK');
        return null;
    }

    const [grid, ...rest] = stack;

    counter++;
    if (counter > 2000) {
        console.log('COMPUTATION TIME OUT', counter);
        return toSimpeSudoku(grid);
    }

    const rows = grid;

    // add row column constraints
    for (let y = 0; y < 9; y++) {
        const row = rows[y];
        for (let x = 0; x < 8; ) {

            let domain1 = row[x];
            let change = false;
            // I tried to be clever and tried not to compare cells twice
            // but this is will falsify the algorithm
            for (let xx = 0; xx < 9; xx++) {
                if (xx === x) {
                    continue;
                }
                let domain2 = row[xx];
                const result = removeValuesFromDomain(domain1, domain2);
                domain1 = result[0];
                change = result[1];
                row[x] = domain1;
            }

            for (let yy = 0; yy < 9; yy++) {
                if (yy === y) {
                    continue;
                }
                let domain2 = rows[yy][x];
                const result = removeValuesFromDomain(domain1, domain2);
                domain1 = result[0];
                change = change || result[1];
                row[x] = domain1;
            }

            const square = SQUARE_TABLE[squareIndex(x, y)]
            for (let c = 0; c < 9; c++) {
                const s = square[c];
                let [xx, yy] = s;
                if (xx === x && yy === y) {
                    continue;
                }
                let domain2 = rows[yy][xx];
                const result = removeValuesFromDomain(domain1, domain2);
                domain1 = result[0];
                change = change || result[1];
                row[x] = domain1;
            }

            if (change || domain1.length === 0) {
                if (domain1.length === 0) {
                    return _solveGridAC3(rest, counter);
                }
            // we loop again and simulate the adding of the edges
            } else {
                x++;
            }
        }

    }

    const isFilled = grid.every(row => {
        return row.every(cells => {
            return cells.length === 1;
        });
    });

    if (!isFilled) {
        const possibleRowAndCells = grid.reduce((current: Array<[number, number]>, row, index) => {
            const possibleCells = row.reduce((currentCells, cells, cellIndex) => {
                if (cells.length > 1) {
                    return currentCells.concat([[index, cellIndex]]);
                }
                return currentCells;
            }, []);
            return current.concat(possibleCells);
        }, []);
        const sortedPossibleRowAndCells = _.sortBy(possibleRowAndCells, ([rowIndex, cellIndex]) => {
            return grid[rowIndex][cellIndex].length;
        });
        // use a random variable
        // let [rowIndex, cellIndex] = possibleRowAndCells[_.random(0, possibleRowAndCells.length - 1)];
        // minimum remaining value
        const [rowIndex, cellIndex] = sortedPossibleRowAndCells[0];
        const cell = grid[rowIndex][cellIndex];
        const newGrids = cell.map(n => {
            return grid.map((row, r) => {
                if (r === rowIndex) {
                    return row.map((cells, c) => {
                        if (c === cellIndex) {
                            return [n];
                        }
                        return [].concat(cells);
                    });
                }
                return [].concat(row);
            });
        });
        const newStack = newGrids.concat(rest);
        return _solveGridAC3(newStack, counter);
    }

    console.log('counter: ' + counter);
    return toSimpeSudoku(grid);

}

export function solve (grid: SimpleSudoku) : SimpleSudoku {
    const stack = [toDomainSudoku(grid)];
    return _solveGridAC3(stack, 0);
}
