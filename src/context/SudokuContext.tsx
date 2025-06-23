import React, {createContext, useContext, useReducer, useCallback, ReactNode} from "react";
import {Cell, SimpleSudoku, CellCoordinates} from "src/engine/types";
import {simpleSudokuToCells, squareIndex} from "src/engine/utility";

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

export const INITIAL_SUDOKU_STATE: SudokuState = {
  current: emptyGrid,
  history: [emptyGrid],
  historyIndex: 0,
};

// Action types
export const SET_SUDOKU = "sudoku/SET_SUDOKU";
export const SET_SUDOKU_STATE = "sudoku/SET_SUDOKU_STATE";
const GET_HINT = "sudoku/GET_HINT";
const CLEAR_CELL = "sudoku/CLEAR_CELL";
const SET_NOTES = "sudoku/SET_NOTES";
const SET_NUMBER = "sudoku/SET_NUMBER";
const CLEAR_NUMBER = "sudoku/CLEAR_NUMBER";
const UNDO = "sudoku/UNDO";
const REDO = "sudoku/REDO";

type SudokuAction =
  | {type: typeof SET_SUDOKU; sudoku: Cell[]}
  | {type: typeof SET_SUDOKU_STATE; sudokuState: SudokuState}
  | {type: typeof GET_HINT; cellCoordinates: CellCoordinates}
  | {type: typeof CLEAR_CELL; cellCoordinates: CellCoordinates}
  | {type: typeof SET_NOTES; cellCoordinates: CellCoordinates; notes: number[]}
  | {type: typeof SET_NUMBER; cellCoordinates: CellCoordinates; number: number}
  | {type: typeof CLEAR_NUMBER; cellCoordinates: CellCoordinates}
  | {type: typeof UNDO}
  | {type: typeof REDO};

// When a number is set, remove conflicting notes.
function fixSudokuNotes(sudoku: Cell[], newCell: Cell) {
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

function sudokuReducer(state: SudokuState, action: SudokuAction): SudokuState {
  switch (action.type) {
    case SET_SUDOKU_STATE:
      return action.sudokuState;
    case SET_SUDOKU:
      return {
        current: action.sudoku,
        history: [action.sudoku],
        historyIndex: 0,
      };
    case UNDO:
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          current: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    case REDO:
      if (state.historyIndex > 0) {
        return {
          ...state,
          current: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    case GET_HINT:
    case CLEAR_CELL:
    case SET_NOTES:
    case SET_NUMBER:
    case CLEAR_NUMBER:
      const {x, y} = action.cellCoordinates;
      let newGrid = state.current.map((cell) => {
        const isCell = cell.x === x && cell.y === y;
        if (isCell && !cell.initial) {
          switch (action.type) {
            case SET_NOTES: {
              return {
                ...cell,
                notes: action.notes,
                number: 0,
              };
            }
            case SET_NUMBER: {
              return {
                ...cell,
                number: action.number,
                notes: [],
              };
            }
            case CLEAR_NUMBER: {
              return {
                ...cell,
                number: 0,
              };
            }
            case CLEAR_CELL: {
              return {
                ...cell,
                number: 0,
                notes: [],
              };
            }
            case GET_HINT: {
              return {
                ...cell,
                number: cell.solution,
                notes: [],
              };
            }
            default:
              return cell;
          }
        }
        return cell;
      });

      // Fix notes when setting a number
      if (action.type === SET_NUMBER) {
        const newCell = newGrid.find((cell) => cell.x === x && cell.y === y);
        if (newCell) {
          newGrid = fixSudokuNotes(newGrid, newCell);
        }
      }

      // Add to history
      const newHistory = [newGrid, ...state.history];

      return {
        current: newGrid,
        history: newHistory,
        historyIndex: 0,
      };
    default:
      return state;
  }
}

interface SudokuContextType {
  state: SudokuState;
  setSudoku: (sudoku: SimpleSudoku, solution: SimpleSudoku) => void;
  setSudokuState: (sudokuState: SudokuState) => void;
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

  const setSudoku = useCallback((sudoku: SimpleSudoku, solution: SimpleSudoku) => {
    const cells = simpleSudokuToCells(sudoku, solution);
    dispatch({type: SET_SUDOKU, sudoku: cells});
  }, []);

  const setSudokuState = useCallback((sudokuState: SudokuState) => {
    dispatch({type: SET_SUDOKU_STATE, sudokuState});
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
    setSudokuState,
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
