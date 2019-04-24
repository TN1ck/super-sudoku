//
// Constants
//

export const SET_SUDOKU = "sudoku/SET_SUDOKU";
export const SET_SUDOKU_STATE = "sudoku/SET_SUDOKU_STATE";
const GET_HINT = "sudoku/GET_HINT";
const CLEAR_CELL = "sudoku/CLEAR_CELL";
const SET_NOTE = "sudoku/SET_NOTE";
const CLEAR_NOTE = "sudoku/CLEAR_NOTE";
const SET_NUMBER = "sudoku/SET_NUMBER";
const CLEAR_NUMBER = "sudoku/CLEAR_NUMBER";

import {simpleSudokuToCells} from "src/engine/utility";
import {Cell, SimpleSudoku, CellCoordinates} from "src/engine/types";

//
// Actions
//

interface SudokuAction {
  type: string;
  cellCoordinates: CellCoordinates;
}

interface NoteAction extends SudokuAction {
  note: number;
}

export function getHint(cellCoordinates: CellCoordinates) {
  return {
    type: GET_HINT,
    cellCoordinates,
  };
}

export function clearCell(cellCoordinates: CellCoordinates) {
  return {
    type: CLEAR_CELL,
    cellCoordinates,
  };
}

export function setNote(cellCoordinates: CellCoordinates, note: number): NoteAction {
  return {
    type: SET_NOTE,
    cellCoordinates,
    note,
  };
}

export function clearNote(cellCoordinates: CellCoordinates, note: number): NoteAction {
  return {
    type: CLEAR_NOTE,
    cellCoordinates,
    note,
  };
}

interface SetNumberAction extends SudokuAction {
  number: number;
}

export function setNumber(cellCoordinates: CellCoordinates, number: number): SetNumberAction {
  return {
    type: SET_NUMBER,
    cellCoordinates,
    number,
  };
}

export function clearNumber(cellCoordinates: CellCoordinates): SudokuAction {
  return {
    type: CLEAR_NUMBER,
    cellCoordinates,
  };
}

export function setSudoku(sudoku: SimpleSudoku, solution: SimpleSudoku) {
  return {
    type: SET_SUDOKU,
    sudoku: simpleSudokuToCells(sudoku, solution),
  };
}

export type SudokuState = Cell[];

export function setSudokuState(sudokuState: SudokuState) {
  return {
    type: SET_SUDOKU_STATE,
    sudoku: sudokuState,
  };
}

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
    ![SET_NOTE, SET_SUDOKU, CLEAR_NOTE, SET_NUMBER, CLEAR_NUMBER, CLEAR_CELL, GET_HINT, SET_SUDOKU_STATE].includes(
      action.type,
    )
  ) {
    return state;
  }

  switch (action.type) {
    case SET_SUDOKU:
    case SET_SUDOKU_STATE:
      return action.sudoku;
  }

  const {x, y} = (action as SudokuAction).cellCoordinates;
  const newGrid = state.map(cell => {
    const isCell = cell.x === x && cell.y === y;
    if (isCell && !cell.initial) {
      switch (action.type) {
        case SET_NOTE: {
          const notes = cell.notes.filter(n => n !== action.note).concat(action.note);
          return {...cell, notes};
        }
        case CLEAR_NOTE: {
          const notes = cell.notes.filter(n => n !== action.note);
          return {...cell, notes};
        }
        case CLEAR_CELL:
          return {...cell, notes: [], number: 0};
        case SET_NUMBER:
          return {...cell, number: action.number};
        case CLEAR_NUMBER:
          return {...cell, number: 0};
        case GET_HINT:
          return {
            ...cell,
            number: cell.solution,
          };
        default:
          return cell;
      }
    }
    return cell;
  });

  return newGrid;
}
