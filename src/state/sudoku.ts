//
// Constants
//

export const SET_SUDOKU = "sudoku/SET_SUDOKU";
export const SET_SUDOKU_STATE = "sudoku/SET_SUDOKU_STATE";
const GET_HINT = "sudoku/GET_HINT";
const CLEAR_CELL = "sudoku/CLEAR_CELL";
const SET_NOTES = "sudoku/SET_NOTES";
const SET_NUMBER = "sudoku/SET_NUMBER";
const CLEAR_NUMBER = "sudoku/CLEAR_NUMBER";

import {simpleSudokuToCells, squareIndex} from "src/engine/utility";
import {Cell, SimpleSudoku, CellCoordinates} from "src/engine/types";
import {AnyAction} from "redux";

//
// Actions
//

interface SudokuAction {
  type: string;
  cellCoordinates: CellCoordinates;
}

interface NoteAction extends SudokuAction {
  notes: number[];
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

export function setNotes(cellCoordinates: CellCoordinates, notes: number[]): NoteAction {
  return {
    type: SET_NOTES,
    cellCoordinates,
    notes,
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

export const INITIAL_SUDOKU_STATE = emptyGrid;

// When a number is set, remove conflicting notes.
function fixSudokuNotes(sudoku: SudokuState, newCell: Cell) {
  sudoku = sudoku.map((cell) => {
    if (cell.x === newCell.x) {
      return {
        ...cell,
        notes: cell.notes.filter((n) => n !== newCell.number),
      };
    }
    return cell;
  });

  sudoku = sudoku.map((cell) => {
    if (cell.y === newCell.y) {
      return {
        ...cell,
        notes: cell.notes.filter((n) => n !== newCell.number),
      };
    }
    return cell;
  });

  return sudoku.map((cell) => {
    if (squareIndex(cell.x, cell.y) === squareIndex(newCell.x, newCell.y)) {
      return {
        ...cell,
        notes: cell.notes.filter((n) => n !== newCell.number),
      };
    }
    return cell;
  });
}

export default function sudokuReducer(state: SudokuState = INITIAL_SUDOKU_STATE, action: AnyAction) {
  if (
    ![SET_NOTES, SET_SUDOKU, SET_NUMBER, CLEAR_NUMBER, CLEAR_CELL, GET_HINT, SET_SUDOKU_STATE].includes(action.type)
  ) {
    return state;
  }

  switch (action.type) {
    case SET_SUDOKU:
    case SET_SUDOKU_STATE:
      return action.sudoku;
  }

  const {x, y} = (action as SudokuAction).cellCoordinates;
  const newGrid = state.map((cell) => {
    const isCell = cell.x === x && cell.y === y;
    if (isCell && !cell.initial) {
      switch (action.type) {
        case SET_NOTES: {
          const notes = (action as NoteAction).notes;
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

  if (action.type === SET_NUMBER) {
    const {x, y} = (action as SudokuAction).cellCoordinates;
    const newCell = newGrid.find((cell) => cell.x === x && cell.y === y);
    return fixSudokuNotes(newGrid, newCell!);
  }

  return newGrid;
}
