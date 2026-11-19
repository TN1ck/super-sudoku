import React, {createContext, useContext, useReducer, useCallback, ReactNode} from "react";
import isEqual from "lodash-es/isEqual";
import {Cell, CellCoordinates} from "src/lib/engine/types";
import {findCell, sharesUnit, simpleSudokuToCells} from "src/lib/engine/utility";
import {START_SUDOKU} from "src/lib/game/sudokus";

export interface SudokuState {
  current: Cell[];
  history: Cell[][];
  historyIndex: number;
}

export const emptyGrid: Cell[] = simpleSudokuToCells([
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
]);

export function createSudokuState(current: Cell[]): SudokuState {
  return {current, history: [current], historyIndex: 0};
}

export function canUndo(state: SudokuState) {
  return state.historyIndex < state.history.length - 1;
}

export const INITIAL_SUDOKU_STATE = createSudokuState(simpleSudokuToCells(START_SUDOKU.sudoku, START_SUDOKU.solution));
export const INITIAL_CREATE_NEW_SUDOKU_STATE = createSudokuState(emptyGrid);

// Action types
const SET_SUDOKU = "sudoku/SET_SUDOKU";
const GET_HINT = "sudoku/GET_HINT";
const CLEAR_CELL = "sudoku/CLEAR_CELL";
const SET_NOTES = "sudoku/SET_NOTES";
const SET_NUMBER = "sudoku/SET_NUMBER";
const CLEAR_NUMBER = "sudoku/CLEAR_NUMBER";
const UNDO = "sudoku/UNDO";
const REDO = "sudoku/REDO";

type SudokuAction =
  | {type: typeof SET_SUDOKU; sudoku: Cell[]}
  | {type: typeof GET_HINT; cellCoordinates: CellCoordinates}
  | {type: typeof CLEAR_CELL; cellCoordinates: CellCoordinates}
  | {type: typeof SET_NOTES; cellCoordinates: CellCoordinates; notes: number[]}
  | {type: typeof SET_NUMBER; cellCoordinates: CellCoordinates; number: number}
  | {type: typeof CLEAR_NUMBER; cellCoordinates: CellCoordinates}
  | {type: typeof UNDO}
  | {type: typeof REDO};

export function sudokuReducer(state: SudokuState, action: SudokuAction): SudokuState {
  switch (action.type) {
    case SET_SUDOKU:
      return createSudokuState(action.sudoku);
    case UNDO:
    case REDO: {
      const historyIndex = state.historyIndex + (action.type === UNDO ? 1 : -1);
      const current = state.history[historyIndex];
      return current ? {...state, current, historyIndex} : state;
    }
  }

  const selected = findCell(state.current, action.cellCoordinates);
  if (!selected || selected.initial) {
    return state;
  }

  let edited: Cell;
  switch (action.type) {
    case SET_NOTES:
      edited = {...selected, number: 0, notes: action.notes};
      break;
    case CLEAR_NUMBER:
      edited = {...selected, number: 0};
      break;
    case CLEAR_CELL:
      edited = {...selected, number: 0, notes: []};
      break;
    case SET_NUMBER:
    case GET_HINT:
      edited = {...selected, number: action.type === GET_HINT ? selected.solution : action.number, notes: []};
      break;
  }

  const newGrid = state.current.map((cell) => {
    if (cell === selected) {
      return edited;
    }
    if (edited.number !== 0 && cell.notes.includes(edited.number) && sharesUnit(cell, edited)) {
      return {...cell, notes: cell.notes.filter((note) => note !== edited.number)};
    }
    return cell;
  });

  // A new edit replaces any moves that could have been redone.
  if (isEqual(newGrid, state.current)) {
    return state;
  }
  const newHistory = [newGrid, ...state.history.slice(state.historyIndex)];

  return {
    current: newGrid,
    history: newHistory,
    historyIndex: 0,
  };
}

interface SudokuContextType {
  state: SudokuState;
  setSudoku: (cells: Cell[]) => void;
  getHint: (cellCoordinates: CellCoordinates) => void;
  clearCell: (cellCoordinates: CellCoordinates) => void;
  setNotes: (cellCoordinates: CellCoordinates, notes: number[]) => void;
  setNumber: (cellCoordinates: CellCoordinates, number: number) => void;
  clearNumber: (cellCoordinates: CellCoordinates) => void;
  undo: () => void;
  redo: () => void;
}

const SudokuContext = createContext<SudokuContextType | undefined>(undefined);

interface SudokuProviderProps {
  children: ReactNode;
  initialState?: SudokuState;
}

export function SudokuProvider({children, initialState = INITIAL_SUDOKU_STATE}: SudokuProviderProps) {
  const [state, dispatch] = useReducer(sudokuReducer, initialState);

  const setSudoku = useCallback((cells: Cell[]) => {
    dispatch({type: SET_SUDOKU, sudoku: cells});
  }, []);

  const getHint = useCallback((cellCoordinates: CellCoordinates) => {
    dispatch({type: GET_HINT, cellCoordinates});
  }, []);

  const clearCell = useCallback((cellCoordinates: CellCoordinates) => {
    dispatch({type: CLEAR_CELL, cellCoordinates});
  }, []);

  const setNotes = useCallback((cellCoordinates: CellCoordinates, notes: number[]) => {
    dispatch({type: SET_NOTES, cellCoordinates, notes});
  }, []);

  const setNumber = useCallback((cellCoordinates: CellCoordinates, number: number) => {
    dispatch({type: SET_NUMBER, cellCoordinates, number});
  }, []);

  const clearNumber = useCallback((cellCoordinates: CellCoordinates) => {
    dispatch({type: CLEAR_NUMBER, cellCoordinates});
  }, []);

  const undo = useCallback(() => {
    dispatch({type: UNDO});
  }, []);

  const redo = useCallback(() => {
    dispatch({type: REDO});
  }, []);

  const value = {
    state,
    setSudoku,
    getHint,
    clearCell,
    setNotes,
    setNumber,
    clearNumber,
    undo,
    redo,
  };

  return <SudokuContext.Provider value={value}>{children}</SudokuContext.Provider>;
}

export function useSudoku() {
  const context = useContext(SudokuContext);
  if (context === undefined) {
    throw new Error("useSudoku must be used within a SudokuProvider");
  }
  return context;
}
