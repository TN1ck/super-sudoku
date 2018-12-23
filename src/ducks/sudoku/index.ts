//
// Constants
//

const SET_SUDOKU = "sudoku/SET_SUDOKU";
const GET_HINT = "sudoku/GET_HINT";
const CLEAR_CELL = "sudoku/CLEAR_CELL";
const SET_NOTE = "sudoku/SET_NOTE";
const CLEAR_NOTE = "sudoku/CLEAR_NOTE";
const SET_NUMBER = "sudoku/SET_NUMBER";
const CLEAR_NUMBER = "sudoku/CLEAR_NUMBER";

import {DIFFICULTY, Cell, SimpleSudoku, simpleSudokuToCells} from "src/engine/utility";

//
// Actions
//

interface NoteAction {
  type: string;
  cell: Cell;
  note: number;
}

export function getHint(cell: Cell) {
  return {
    type: GET_HINT,
    cell,
  };
}

export function clearCell(cell: Cell) {
  return {
    type: CLEAR_CELL,
    cell,
  };
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

export function setSudoku(difficulty: DIFFICULTY, sudoku: SimpleSudoku, solution: SimpleSudoku) {
  return {
    difficulty,
    type: SET_SUDOKU,
    sudoku: simpleSudokuToCells(sudoku, solution),
    solution,
  };
}

export type SudokuState = Cell[];

export const emptyGrid: SudokuState = simpleSudokuToCells([
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
]);

const initialState = emptyGrid;

export default function sudokuReducer(state: SudokuState = initialState, action) {
  if (
    ![SET_NOTE, SET_SUDOKU, CLEAR_NOTE, SET_NUMBER, CLEAR_NUMBER, CLEAR_CELL, GET_HINT].find(d => d === action.type)
  ) {
    return state;
  }

  switch (action.type) {
    case SET_SUDOKU:
      return action.sudoku;
  }

  const actionCell: Cell = action.cell;
  // hide all menus in all cells
  const newGrid = state.map(cell => {
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
      case CLEAR_CELL:
        if (id === actionCellId) {
          return {...cell, notes: new Set(), number: 0};
        }
      case SET_NUMBER:
        if (id === actionCellId) {
          return {...cell, number: action.number};
        }
        return cell;
      case CLEAR_NUMBER:
        if (id === actionCellId) {
          return {...cell, number: 0};
        }
      case GET_HINT:
        if (id === actionCellId) {
          console.log(cell, "get hint");
          return {
            ...cell,
            number: cell.solution,
          };
        }
        return cell;
      default:
        return cell;
    }
  });

  return newGrid;
}
