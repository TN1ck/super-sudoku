import * as _ from 'lodash';
import {
    SUDOKU_NUMBERS,
    SimpleCell,
    ComplexSudoku
} from './utility';

function duplicates (array: ComplexSudoku) : ComplexSudoku {
    const grouped = _.groupBy(array, c => String(c.number));
    const picked = _.pickBy(
        grouped,
        x => x.length > 1
    );
    return [].concat(..._.values(picked));
}

// A sudoku has 3 constraints

function checkRow (grid: ComplexSudoku, cell: SimpleCell) : ComplexSudoku {
    const currentRow = grid.filter(c => c.x === cell.x);
    const currentRowNumbers = currentRow.filter(c => c.number);
    return currentRowNumbers;
}

function checkColumn (grid: ComplexSudoku, cell: SimpleCell) : ComplexSudoku {
    const currentColumn = grid.filter(c => c.y === cell.y);
    const currentColumnNumbers = currentColumn.filter(c => c.number);
    return currentColumnNumbers;
}

function checkSquare (grid: ComplexSudoku, cell: SimpleCell) : ComplexSudoku {
    const squares: Array<ComplexSudoku> = _.values(_.groupBy(
        grid,
        (c: SimpleCell) => {
            return `${Math.floor(c.x / 3)}-${Math.floor(c.y / 3)}`;
        }
    ));

    const currentSquare = squares.filter(square => {
        return square.indexOf(cell) !== -1;
    })[0];
    const currentSquareNumbers = currentSquare.filter(c => c.number);
    return currentSquareNumbers;
}

function checkCellForDuplicates (grid: ComplexSudoku, cell: SimpleCell) : ComplexSudoku {
    const row = duplicates(checkRow(grid, cell));
    const column = duplicates(checkColumn(grid, cell));
    const square = duplicates(checkSquare(grid, cell));
    const uniques = _.uniqBy(
        row.concat(column).concat(square),
        function (c: SimpleCell) {
            return `${c.x}-${c.y}`;
        }
    );
    return uniques;
}

function everyFieldIsFilledWithANumber (grid: ComplexSudoku): Boolean {
    return grid.filter(c => c.number).length === grid.length;
}

function everyFieldIsCorrect (grid: ComplexSudoku): Boolean {
    const result = grid.every(c => {
        return checkCellForDuplicates(grid, c).length === 0;
    });
    return result;
}

function getMinimumRemainingValue (grid: ComplexSudoku) {
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
    return emptyCell;
}

/**
 * Only used for the UI, to show how it's solved
 */
export function* solveGridGenerator (stack: Array<ComplexSudoku> = []) : Iterable<ComplexSudoku> {
    const[grid, ...rest] = stack;

    const _everyFieldIsFilledWithANumber = everyFieldIsFilledWithANumber(grid);
    const _everyFieldIsCorrect = everyFieldIsCorrect(grid);
    if (_everyFieldIsFilledWithANumber && _everyFieldIsCorrect) {
        yield grid;
    } else {
        yield grid;
        if (!_everyFieldIsCorrect) {
            yield *solveGridGenerator(rest);
        } else {
            const emptyCell = getMinimumRemainingValue(grid);

            const newCells: ComplexSudoku = SUDOKU_NUMBERS
                .map((n, i) => {
                    return Object.assign({}, emptyCell, {number: i + 1});
                });

            const newGrids = newCells.map((c: SimpleCell): ComplexSudoku => {
                // remove the cell from the grid and use the new one
                const newGrid = grid.filter(cc => `${c.x}-${c.y}` !== `${cc.x}-${cc.y}`);
                newGrid.push(c);
                return newGrid;
            }).filter(g => everyFieldIsCorrect(g));

            yield *solveGridGenerator(newGrids.concat(rest));
        }
    }
}

export function _solveGrid (stack: Array<ComplexSudoku> = [], iterations: number) : {
    sudoku: ComplexSudoku,
    iterations: number
} {
    const[grid, ...rest] = stack;
    iterations++;

    const _everyFieldIsFilledWithANumber = everyFieldIsFilledWithANumber(grid);
    const _everyFieldIsCorrect = everyFieldIsCorrect(grid);
    if (_everyFieldIsFilledWithANumber && _everyFieldIsCorrect) {
        console.log('iterations: ' + iterations);
        return {
            sudoku: grid,
            iterations
        };
    }
    // should actually never happen
    if (!_everyFieldIsCorrect) {
        return _solveGrid(rest, iterations);
    }
    const emptyCell = getMinimumRemainingValue(grid);

    const newCells: ComplexSudoku = SUDOKU_NUMBERS
        .map((n, i) => {
            return Object.assign({}, emptyCell, {number: i + 1});
        });

    const newGrids = newCells.map((c: SimpleCell): ComplexSudoku => {
        // remove the cell from the grid and use the new one
        const newGrid = grid.filter(cc => `${c.x}-${c.y}` !== `${cc.x}-${cc.y}`);
        newGrid.push(c);
        return newGrid;
    }).filter(g => everyFieldIsCorrect(g));

    return _solveGrid(newGrids.concat(rest), iterations);
}

export function solve (grid: ComplexSudoku) : {
    sudoku: ComplexSudoku,
    iterations: number
} {
    return _solveGrid([grid], 0);
}