import * as _ from 'lodash';
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

export type SimpleSudoku = Array<Array<number>>;
export type DomainSudoku = Array<Array<Array<number>>>;

export const SUDOKU_COORDINATES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const SUDOKU_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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
    // we sort them, so we can use an optimization
    const squares = _.sortBy(_.keys(grouped), k => k)
        .map(k => _.sortBy(grouped[k], ([x, y]) => `${y}-${x}`));
    return squares;
})();

export function squareIndex (x, y) {
    return Math.floor(y  / 3) * 3 + Math.floor(x / 3);
}

export function printSimpleSudoku (grid: SimpleSudoku) {
    return grid.map(row => {
        return row.map(c => c === undefined ? '_' : ('' + c)).join('');
    }).join('\n');
}
