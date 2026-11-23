import React, {createContext, ReactNode, useCallback, useContext, useMemo, useReducer} from "react";
import {Cell, CellCoordinates} from "src/lib/engine/types";
import {
  areCellsEqual,
  createEmptySimpleSudoku,
  findCell,
  hasBoardShape,
  sharesUnit,
  simpleSudokuToCells,
  SUDOKU_NUMBERS,
} from "src/lib/engine/utility";
import {START_SUDOKU} from "src/lib/game/sudokus";

export interface SudokuState {
  current: Cell[];
  history: Cell[][];
  historyIndex: number;
}

export const emptyGrid: Cell[] = simpleSudokuToCells(createEmptySimpleSudoku());

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
const UNDO = "sudoku/UNDO";
const REDO = "sudoku/REDO";

type SudokuAction =
  | {type: typeof SET_SUDOKU; sudoku: Cell[]}
  | {type: typeof GET_HINT; cellCoordinates: CellCoordinates}
  | {type: typeof CLEAR_CELL; cellCoordinates: CellCoordinates}
  | {type: typeof SET_NOTES; cellCoordinates: CellCoordinates; notes: number[]}
  | {type: typeof SET_NUMBER; cellCoordinates: CellCoordinates; number: number}
  | {type: typeof UNDO}
  | {type: typeof REDO};

export function sudokuReducer(state: SudokuState, action: SudokuAction): SudokuState {
  switch (action.type) {
    case SET_SUDOKU:
      return hasBoardShape(action.sudoku) ? createSudokuState(action.sudoku) : state;
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

  const cleared = {...selected};
  delete cleared.autoNotesHidden;
  let edited: Cell;
  switch (action.type) {
    case SET_NOTES:
      if (!action.notes.every((note) => SUDOKU_NUMBERS.includes(note))) {
        return state;
      }
      edited = {...cleared, number: 0, notes: [...new Set(action.notes)].sort((a, b) => a - b)};
      if (!edited.notes.length) {
        edited.autoNotesHidden = true;
      }
      break;
    case CLEAR_CELL:
      edited = {...cleared, number: 0, notes: []};
      break;
    case SET_NUMBER:
    case GET_HINT: {
      const number = action.type === GET_HINT ? selected.solution : action.number;
      if (!SUDOKU_NUMBERS.includes(number)) {
        return state;
      }
      edited = {...cleared, number, notes: []};
      break;
    }
  }

  const newGrid = state.current.map((cell): Cell => {
    if (cell === selected) {
      return edited;
    }
    if (edited.number !== 0 && cell.notes.includes(edited.number) && sharesUnit(cell, edited)) {
      const notes = cell.notes.filter((note) => note !== edited.number);
      return notes.length ? {...cell, notes} : {...cell, notes, autoNotesHidden: true};
    }
    return cell;
  });

  // A new edit replaces any moves that could have been redone.
  if (areCellsEqual(newGrid, state.current)) {
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

  const undo = useCallback(() => {
    dispatch({type: UNDO});
  }, []);

  const redo = useCallback(() => {
    dispatch({type: REDO});
  }, []);

  const value = useMemo(
    () => ({
      state,
      setSudoku,
      getHint,
      clearCell,
      setNotes,
      setNumber,
      undo,
      redo,
    }),
    [state, setSudoku, getHint, clearCell, setNotes, setNumber, undo, redo],
  );

  return <SudokuContext.Provider value={value}>{children}</SudokuContext.Provider>;
}

export function useSudoku() {
  const context = useContext(SudokuContext);
  if (context === undefined) {
    throw new Error("useSudoku must be used within a SudokuProvider");
  }
  return context;
}
