//
// Constants
//

const SET_SUDOKU = 'sudoku/SET_SUDOKU';
const SET_NOTE = 'sudoku/SET_NOTE';
const CLEAR_NOTE = 'sudoku/CLEAR_NOTE';
const SET_NUMBER = 'sudoku/SET_NUMBER';
const CLEAR_NUMBER = 'sudoku/CLEAR_NUMBER';
const GET_HINT = 'sudoku/GET_HINT';
const SELECT_NUMBER_FOR_EDIT = 'sudoku/SELECT_NUMBER_FOR_EDIT';

import {DIFFICULTY} from 'src/engine/utility';

import {Cell, parseSudoku, solvableSudoku1} from './model';

//
// Actions
//

interface NoteAction {
  type: string;
  cell: Cell;
  note: number;
}

export function setNote(cell: Cell, note: number): NoteAction {
  return {
    type: SET_NOTE,
    cell,
    note,
  };
}

export function clearNote(cell: Cell, note: number): NoteAction {
  return {
    type: CLEAR_NOTE,
    cell,
    note,
  };
}

interface SetNumberAction {
  type: string;
  cell: Cell;
  number: number;
}

export function setNumber(cell: Cell, number: number): SetNumberAction {
  return {
    type: SET_NUMBER,
    cell,
    number,
  };
}

interface CellAction {
  type: string;
  cell: Cell;
}

export function clearNumber(cell: Cell): CellAction {
  return {
    type: CLEAR_NUMBER,
    cell,
  };
}

export function getHint(cell: Cell): CellAction {
  return {
    type: GET_HINT,
    cell,
  };
}

export function setSudoku(difficulty: DIFFICULTY, sudoku: string) {
  return {
    difficulty,
    type: SET_SUDOKU,
    sudoku: parseSudoku(sudoku),
  };
}

export interface SudokuState {
  grid: Cell[];
  selectedNumber: number | undefined;
}

const initialGrid = parseSudoku(solvableSudoku1);

const initialState: SudokuState = {
  grid: initialGrid,
  selectedNumber: undefined,
};

export default function sudokuReducer(
  state: SudokuState = initialState,
  action,
) {
  if (
    ![
      SET_NOTE,
      SET_SUDOKU,
      CLEAR_NOTE,
      SET_NUMBER,
      CLEAR_NUMBER,
      GET_HINT,
      SELECT_NUMBER_FOR_EDIT,
    ].find(d => d === action.type)
  ) {
    return state;
  }

  switch (action.type) {
    case SET_SUDOKU:
      return {...state, grid: action.sudoku};
  }

  const actionCell: Cell = action.cell;
  // hide all menus in all cells
  const newGrid = state.grid.map(cell => {
    const id = `${cell.x}-${cell.y}`;
    const actionCellId = `${actionCell.x}-${actionCell.y}`;
    switch (action.type) {
      case SET_NOTE:
        if (id === actionCellId) {
          return {...cell, notes: new Set(cell.notes.add(action.note))};
        }
        return cell;
      case CLEAR_NOTE:
        if (id === actionCellId) {
          cell.notes.delete(action.note);
          return {...cell, notes: new Set(cell.notes)};
        }
        return cell;
      case SET_NUMBER:
        if (id === actionCellId) {
          return {...cell, number: action.number};
        }
        return cell;
      case CLEAR_NUMBER:
        if (id === actionCellId) {
          return {...cell, number: undefined};
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

  return {...state, grid: newGrid};
}
