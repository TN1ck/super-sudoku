import * as _ from 'lodash';
import {
    Cell
} from 'src/ducks/sudoku/model';

function duplicates (array: Array<Cell>) : Array<Cell> {
    const grouped = _.groupBy(array, c => String(c.number));
    const picked = _.pickBy(
        grouped,
        x => x.length > 1
    );

    return [].concat(..._.values(picked));

}

// A sudoku has 3 constraints

function checkRow (grid: Array<Cell>, cell: Cell) : Array<Cell> {
    const currentRow = grid.filter(c => c.x === cell.x);
    const currentRowNumbers = currentRow.filter(c => c.number);
    return currentRowNumbers;
}

function checkColumn (grid: Array<Cell>, cell: Cell) : Array<Cell> {
    const currentColumn = grid.filter(c => c.y === cell.y);
    const currentColumnNumbers = currentColumn.filter(c => c.number);
    return currentColumnNumbers;
}

function checkSquare (grid: Array<Cell>, cell: Cell) : Array<Cell> {
    const squares: Array<Array<Cell>> = _.values(_.groupBy(
        grid,
        (c: Cell) => {
            return `${Math.floor((c.x - 1) / 3)}-${Math.floor((c.y - 1) / 3)}`;
        }
    ));

    const currentSquare = squares.filter(square => {
        return square.indexOf(cell) !== -1;
    })[0];
    const currentSquareNumbers = currentSquare.filter(c => c.number);
    return currentSquareNumbers;
}

function checkCellForDuplicates (grid: Array<Cell>, cell: Cell) : Array<Cell> {
    const row = duplicates(checkRow(grid, cell));
    const column = duplicates(checkColumn(grid, cell));
    const square = duplicates(checkSquare(grid, cell));
    const uniques = _.uniqBy(
        row.concat(column).concat(square),
        function (c: Cell) {
            return `${c.x}-${c.y}`;
        }
    );
    return uniques;
}

function everyFieldIsFilledWithANumber (grid: Array<Cell>): Boolean {
    return grid.filter(c => c.number).length === grid.length;
}

function everyFieldIsCorrect (grid: Array<Cell>): Boolean {
    const result = grid.every(c => {
        return checkCellForDuplicates(grid, c).length === 0;
    });
    return result;
}

export function* solveGrid (stack: Array<Array<Cell>> = []) : Iterable<Array<Array<Cell> | Array<Cell> | Cell>> {
    const[grid, ...rest] = stack;

    const _everyFieldIsFilledWithANumber = everyFieldIsFilledWithANumber(grid);
    const _everyFieldIsCorrect = everyFieldIsCorrect(grid);
    if (_everyFieldIsFilledWithANumber && _everyFieldIsCorrect) {
        yield grid;
    } else {
        yield grid;
        if (!_everyFieldIsCorrect) {
            yield *solveGrid(rest);
        } else {
            // take an empty field using
            // minimum remaining value
            const remainingValues = grid
                .filter(c => !c.number)
                .map(c => {
                    const cells = checkRow(grid, c)
                        .concat(checkColumn(grid, c))
                        .concat(checkSquare(grid, c));
                    const uniqCells = _.uniqBy(cells, c => c.number);
                    return {
                        cell: c,
                        cells: uniqCells
                    }
                });
            const sortedRemainingValues = _.sortBy(remainingValues, ({cells}) => -cells.length);
            const emptyCell = sortedRemainingValues[0].cell;

            // find a valid value
            const numbers = _.range(1, 10);
            const filteredNumbers: Array<Cell> = numbers
                .map((n, i) => {
                    return Object.assign({}, emptyCell, {number: i + 1});
                })
                .filter(c => {
                    return everyFieldIsCorrect(grid);
                });

            // we hit a wall
            if (filteredNumbers.length === 0) {
                yield *solveGrid(rest);
            } else {
                const newGrids = filteredNumbers.map((c: Cell): Array<Cell> => {
                // remove the cell from the grid and use the new one
                const newGrid = grid.filter(cc => `${c.x}-${c.y}` !== `${cc.x}-${cc.y}`);
                    newGrid.push(c);
                    return newGrid;
                });

                yield *solveGrid(newGrids.concat(rest));
            }
        }
    }
}
