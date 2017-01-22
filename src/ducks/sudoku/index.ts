//
// Constants
//

const SHOW_MENU = 'sudoku/SHOW_MENU';
const SET_NOTES = 'sudoku/SET_NOTES';
const SET_NUMBER = 'sudoku/SET_NUMBER';
const CLEAR_NUMBER = 'sudoku/CLEAR_NUMBER';
const GET_HINT = 'sudoku/GET_HINT';
const SELECT_NUMBER_FOR_EDIT = 'sudoku/SELECT_NUMBER_FOR_EDIT';

import {
    Cell,
    parseSudoku,
    solvableSudoku1
} from './model';

//
// Actions
//

interface SetNotesAction {
    type: string;
    cell: Cell;
    notes: Set<number>;
}

export function setNotes (cell: Cell, notes: Set<number>) : SetNotesAction {
    return {
        type: SET_NOTES,
        cell,
        notes
    };
}

interface SetNumberAction {
    type: string;
    cell: Cell;
    number: number;
}

export function setNumber (cell: Cell, number: number) : SetNumberAction {
    return {
        type: SET_NUMBER,
        cell,
        number
    };
}

interface CellAction {
    type: string;
    cell: Cell;
}

export function clearNumber (cell: Cell) : CellAction {
    return {
        type: CLEAR_NUMBER,
        cell
    };
}

export function getHint (cell: Cell) : CellAction {
    return {
        type: GET_HINT,
        cell
    };
}

export function showMenu (cell: Cell) : CellAction {
    return {
        type: SHOW_MENU,
        cell: cell
    };
}

export interface SudokuState {
    grid: Array<Cell>;
    selectedNumber: number | undefined;
}

const initialGrid = parseSudoku(solvableSudoku1);

const initialState : SudokuState = {
    grid: initialGrid,
    selectedNumber: undefined
};

export default function sudokuReducer (state: SudokuState = initialState, action) {
    if (![
        SHOW_MENU,
        SET_NOTES,
        SET_NUMBER,
        CLEAR_NUMBER,
        GET_HINT,
        SELECT_NUMBER_FOR_EDIT
    ].find(d => d === action.type)) {
        return state;
    }
    const actionCell : Cell = action.cell;
        // hide all menus in all cells
    const newGrid = state.grid.map(cell => {
        const id = `${cell.x}-${cell.y}`;
        const actionCellId = `${actionCell.x}-${actionCell.y}`;
            switch (action.type) {
            case SHOW_MENU:
                if (cell.showMenu || id === actionCellId) {
                    return Object.assign({}, cell, {
                            showMenu: !cell.showMenu
                        });
                    }
                    return cell;
            case SET_NOTES:
                return cell;
            case SET_NUMBER:
                if (id === actionCellId) {
                    return Object.assign({}, cell, {
                        number: action.number
                    });
                }
                return cell;
            case CLEAR_NUMBER:
                if (id === actionCellId) {
                    return Object.assign({}, cell, {
                        number: undefined
                    });
                }
                return cell;
            case GET_HINT:
                return cell;
            case SELECT_NUMBER_FOR_EDIT:
                return cell;
            default:
                return cell;
        }
    });

    return Object.assign({}, state, {
        grid: newGrid
    });
}
