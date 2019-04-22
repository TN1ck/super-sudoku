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

import {DIFFICULTY, Cell, SimpleSudoku, simpleSudokuToCells, CellCoordinates} from "src/engine/utility";

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
  if (![SET_NOTE, SET_SUDOKU, CLEAR_NOTE, SET_NUMBER, CLEAR_NUMBER, CLEAR_CELL, GET_HINT].includes(action.type)) {
    return state;
  }

  switch (action.type) {
    case SET_SUDOKU:
      return action.sudoku;
  }

  const {x, y} = (action as SudokuAction).cellCoordinates;
  const newGrid = state.map(cell => {
    const isCell = cell.x === x && cell.y === y;
    if (isCell && !cell.initial) {
      switch (action.type) {
        case SET_NOTE:
          return {...cell, notes: new Set(cell.notes.add(action.note))};
        case CLEAR_NOTE:
          cell.notes.delete(action.note);
          return {...cell, notes: new Set(cell.notes)};
        case CLEAR_CELL:
          return {...cell, notes: new Set(), number: 0};
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
