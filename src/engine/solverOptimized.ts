import * as _ from 'lodash';

interface SimpleCell {
    x: number;
    y: number;
    number: number;
}

function printSimpleSudoku (grid: Array<Array<number>>) {
    return grid.map(row => {
        return row.map(c => c === undefined ? '_' : ('' + c)).join('');
    }).join('\n');
}

function duplicates (array: Array<number>) : number {
    const filtered = array.filter(c => c !== undefined);
    const grouped = _.groupBy(filtered, c => c);
    const picked = _.pickBy(
        grouped,
        x => x.length > 1
    );
    return _.values(picked).length;
}

/*
    _x = 0       _x = 1     _x = 2
.-----0-----------1----------2------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 0
|   y < 3   | y < 3     |   y < 3   |
|-----3-----------4----------5------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 1
| 3 < y < 6 | 3 < y < 6 | 3 < y < 6 |
.-----6-----------7----------8------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 2
|   y > 6   | y > 6     |   y > 6   |
|-----------------------------------|
square = _y * 3 + _x;
*/

const SUDOKU_COORDINATES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const SUDOKU_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// SQUARE TABLE
export const SQUARE_TABLE = (function () {
    const cells: Array<[number, number]> = [].concat(...SUDOKU_COORDINATES.map(x => {
        return SUDOKU_COORDINATES.map(y => {
            return [x, y];
        });
    }));
    const grouped = _.groupBy(cells, ([x, y]) => {
        return Math.floor(y / 3) * 3 + Math.floor(x / 3);
    });
    const squares = _.sortBy(_.keys(grouped), k => k).map(k => grouped[k]);
    return squares;
})();

function isFilled (grid) {
    return grid.every(row => row.every(n => n !== undefined))
}

function isCorrect (rows, columns, squares) {
    const duplicatesInRow = rows.some(row => {
        return duplicates(row) !== 0;
    });
    if (duplicatesInRow) {
        return false;
    }
    const duplicatesInColumns = columns.some(column => {
        return duplicates(column) !== 0;
    });
    if (duplicatesInColumns) {
        return false;
    }
    const duplicatesInSquares = squares.some(square => {
        return duplicates(square) !== 0;
    });
    if (duplicatesInSquares) {
        return false;
    }
    return true;
}

function getColumns (grid) {
    const columns = [];
    // calculate the duplicates for every column
    for (let x = 0; x < 9; x++) {
        const column = [];
        for (let y = 0; y < 9; y++) {
            const cell = grid[y][x];
            column.push(cell);
        }
        columns[x] = column;
    }
    return columns;
}

function getSquares (grid) {
    const squares = [];
     // calculate the duplicates in every square
    for (let s = 0; s < 9; s++) {
        const square = SQUARE_TABLE[s];
        const squareValues = [];
        for (let xy = 0; xy < 9; xy++) {
            const [x, y] = square[xy];
            squareValues.push(grid[y][x]);
        }
        squares[s] = squareValues;
    }
    return squares;
}

function getMinimumRemainingValue (grid, rows, columns, squares) {
    const numberOfRemainingValuesForEveryCell: Array<{x: number, y: number, remainingValues: Array<number>}> = [];

    // find minimum remaining value
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (grid[y][x] === undefined) {
                const row = rows[y];
                const column = columns[x];
                const squareIndex = Math.floor(y  / 3) * 3 + Math.floor(x / 3);
                const square = squares[squareIndex];
                const numbers = row.concat(column).concat(square);
                const remainingValues = SUDOKU_NUMBERS.filter(i => {
                    return numbers.indexOf(i) === -1;
                });
                numberOfRemainingValuesForEveryCell.push({
                    x,
                    y,
                    remainingValues
                });
            }
        }
    }

    const sortedRemainingValues = _.sortBy(numberOfRemainingValuesForEveryCell, c => c.remainingValues.length);
    return sortedRemainingValues[0];
}

function createNewGrids (grid, x, y, values) {
     const newGrids = values.map(number => {
        return grid.map((row, i) => {
            // save some memory
            if (y === i) {
                const newRow = [].concat(row);
                newRow[x] = number;
                return newRow;
            }
            return row;
        });
    });
    return newGrids;
}

export function _solveGrid (stack: Array<Array<Array<number>>> = []) : Array<Array<number>> {
    if (stack.length === 0) {
        return null;
    }
    const [grid, ...rest] = stack;

    const rows    = grid;
    const columns = getColumns(grid);
    const squares = getSquares(grid);

    const completelyFilled = isFilled(grid);
    if (completelyFilled && isCorrect(rows, columns, squares)) {
        return grid;
    } else {
        _solveGrid(rest);
    }

    const {remainingValues, x, y} = getMinimumRemainingValue(grid, rows, columns, squares);
    const newGrids = createNewGrids(grid, x, y, remainingValues);

    return _solveGrid(newGrids.concat(rest));

}

export function solveGrid (stack: Array<Array<Array<number>>> = []) : Array<Array<number>> {
    const t0 = performance.now();
    let result;
    const TIMES = 1000;
    for (let i = TIMES; i > 0; i--) {
        result = _solveGrid(stack);
    }
    const t1 = performance.now();
    console.log("Call to solveGrid took " + (t1 - t0) / TIMES + " milliseconds.")
    return result;
}
