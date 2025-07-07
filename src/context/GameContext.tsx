import React, {createContext, useContext, useReducer, useCallback, ReactNode} from "react";
import {CellCoordinates, DIFFICULTY} from "src/lib/engine/types";
import {START_SUDOKU_COLLECTION, START_SUDOKU_INDEX} from "src/lib/game/sudokus";

export enum GameStateMachine {
  running = "RUNNING",
  paused = "PAUSED",
}

export interface GameState {
  activeCellCoordinates?: CellCoordinates;
  sudokuCollectionName: string;
  notesMode: boolean;
  showCircleMenu: boolean;
  showHints: boolean;
  showMenu: boolean;
  showOccurrences: boolean;
  showWrongEntries: boolean;
  showConflicts: boolean;
  showNotes: boolean;
  state: GameStateMachine;
  sudokuIndex: number;
  won: boolean;
  timesSolved: number;
  previousTimes: number[];
  secondsPlayed: number;
}

export const INITIAL_GAME_STATE: GameState = {
  activeCellCoordinates: undefined,
  sudokuCollectionName: START_SUDOKU_COLLECTION.name,
  notesMode: false,
  showCircleMenu: true,
  showHints: false,
  showConflicts: true,
  showOccurrences: false,
  showWrongEntries: false,
  showMenu: false,
  showNotes: false,
  state: GameStateMachine.paused,
  sudokuIndex: START_SUDOKU_INDEX,
  secondsPlayed: 0,
  timesSolved: 0,
  previousTimes: [],
  won: false,
};

// Action types
const NEW_GAME = "game/NEW_GAME";
const WON_GAME = "game/WON_GAME";
const PAUSE_GAME = "game/PAUSE_GAME";
const CONTINUE_GAME = "game/CONTINUE_GAME";
const SET_GAME_STATE = "game/SET_GAME_STATE";
const RESTART_GAME = "game/RESTART_GAME";
const SHOW_MENU = "game/SHOW_MENU";
const HIDE_MENU = "game/HIDE_MENU";
const SELECT_CELL = "game/SELECT_MENU";
const TOGGLE_SHOW_HINTS = "game/TOGGLE_SHOW_HINTS";
const TOGGLE_SHOW_OCCURRENCES = "game/TOGGLE_SHOW_OCCURRENCES";
const TOGGLE_SHOW_CONFLICTS = "game/TOGGLE_SHOW_CONFLICTS";
const TOGGLE_SHOW_CIRCLE_MENU = "game/TOGGLE_SHOW_CIRCLE_MENU";
const TOGGLE_SHOW_WRONG_ENTRIES = "game/TOGGLE_SHOW_WRONG_ENTRIES";
const ACTIVATE_NOTES_MODE = "game/ACTIVATE_NOTES_MODE";
const DEACTIVATE_NOTES_MODE = "game/DEACTIVATE_NOTES_MODE";
const UPDATE_TIMER = "game/UPDATE_TIME";
const RESET_GAME = "game/RESET_GAME";

type GameAction =
  | {
      type: typeof NEW_GAME;
      sudokuIndex: number;
      sudokuCollectionName: string;
      timesSolved: number;
      previousTimes: number[];
    }
  | {type: typeof SET_GAME_STATE; state: GameState}
  | {type: typeof PAUSE_GAME}
  | {type: typeof CONTINUE_GAME}
  | {
      type: typeof RESTART_GAME;
      sudokuIndex: number;
      sudokuCollectionName: string;
      timesSolved: number;
      previousTimes: number[];
    }
  | {type: typeof SHOW_MENU; showNotes?: boolean}
  | {type: typeof HIDE_MENU}
  | {type: typeof SELECT_CELL; cellCoordinates: CellCoordinates}
  | {type: typeof TOGGLE_SHOW_HINTS}
  | {type: typeof TOGGLE_SHOW_OCCURRENCES}
  | {type: typeof TOGGLE_SHOW_CONFLICTS}
  | {type: typeof TOGGLE_SHOW_CIRCLE_MENU}
  | {type: typeof TOGGLE_SHOW_WRONG_ENTRIES}
  | {type: typeof ACTIVATE_NOTES_MODE}
  | {type: typeof DEACTIVATE_NOTES_MODE}
  | {type: typeof UPDATE_TIMER; secondsPlayed: number}
  | {type: typeof RESET_GAME}
  | {type: typeof WON_GAME};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case SET_GAME_STATE:
      return action.state;
    case NEW_GAME:
      return {
        ...INITIAL_GAME_STATE,
        sudokuIndex: action.sudokuIndex,
        sudokuCollectionName: action.sudokuCollectionName,
        timesSolved: action.timesSolved,
        previousTimes: action.previousTimes,
        state: GameStateMachine.running,
      };
    case WON_GAME:
      const justWon = state.won === false;
      return {
        ...state,
        won: true,
        state: GameStateMachine.paused,
        timesSolved: justWon ? state.timesSolved + 1 : state.timesSolved,
        previousTimes: justWon ? [...state.previousTimes, state.secondsPlayed] : state.previousTimes,
      };
    case PAUSE_GAME:
      return {
        ...state,
        state: GameStateMachine.paused,
      };
    case CONTINUE_GAME:
      // You can't continue a game that is won.
      if (state.won) {
        return state;
      }
      return {
        ...state,
        state: GameStateMachine.running,
      };
    case RESTART_GAME:
      return {
        ...state,
        sudokuIndex: action.sudokuIndex,
        sudokuCollectionName: action.sudokuCollectionName,
        timesSolved: action.timesSolved,
        secondsPlayed: 0,
        previousTimes: action.previousTimes,
        state: GameStateMachine.running,
        won: false,
      };
    case SHOW_MENU:
      return {
        ...state,
        showMenu: true,
        showNotes: action.showNotes || false,
      };
    case HIDE_MENU:
      return {
        ...state,
        showMenu: false,
        showNotes: false,
      };
    case SELECT_CELL:
      return {
        ...state,
        activeCellCoordinates: action.cellCoordinates,
      };
    case TOGGLE_SHOW_HINTS:
      return {
        ...state,
        showHints: !state.showHints,
      };
    case TOGGLE_SHOW_OCCURRENCES:
      return {
        ...state,
        showOccurrences: !state.showOccurrences,
      };
    case TOGGLE_SHOW_CONFLICTS:
      return {
        ...state,
        showConflicts: !state.showConflicts,
      };
    case TOGGLE_SHOW_CIRCLE_MENU:
      return {
        ...state,
        showCircleMenu: !state.showCircleMenu,
      };
    case TOGGLE_SHOW_WRONG_ENTRIES:
      return {
        ...state,
        showWrongEntries: !state.showWrongEntries,
      };
    case ACTIVATE_NOTES_MODE:
      return {
        ...state,
        notesMode: true,
      };
    case DEACTIVATE_NOTES_MODE:
      return {
        ...state,
        notesMode: false,
      };
    case UPDATE_TIMER:
      return {
        ...state,
        secondsPlayed: action.secondsPlayed,
      };
    case RESET_GAME:
      return {
        ...state,
        secondsPlayed: 0,
        state: GameStateMachine.running,
        won: false,
      };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  newGame: (sudokuIndex: number, sudokuCollectionName: string, timesSolved: number, previousTimes: number[]) => void;
  setGameState: (state: GameState) => void;
  wonGame: () => void;
  pauseGame: () => void;
  continueGame: () => void;
  selectCell: (cellCoordinates: CellCoordinates) => void;
  showMenu: (showNotes?: boolean) => void;
  hideMenu: () => void;
  restartGame: (
    sudokuIndex: number,
    sudokuCollectionName: string,
    timesSolved: number,
    previousTimes: number[],
  ) => void;
  toggleShowHints: () => void;
  toggleShowOccurrences: () => void;
  toggleShowConflicts: () => void;
  toggleShowCircleMenu: () => void;
  toggleShowWrongEntries: () => void;
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
  updateTimer: (secondsPlayed: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  initialState?: GameState;
}

export function GameProvider({children, initialState = INITIAL_GAME_STATE}: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const newGame = useCallback(
    (sudokuIndex: number, sudokuCollectionName: string, timesSolved: number, previousTimes: number[]) => {
      dispatch({type: NEW_GAME, sudokuIndex, sudokuCollectionName, timesSolved, previousTimes});
    },
    [],
  );

  const setGameState = useCallback((gameState: GameState) => {
    dispatch({type: SET_GAME_STATE, state: gameState});
  }, []);

  const wonGame = useCallback(() => {
    dispatch({type: WON_GAME});
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({type: PAUSE_GAME});
  }, []);

  const continueGame = useCallback(() => {
    dispatch({type: CONTINUE_GAME});
  }, []);

  const selectCell = useCallback((cellCoordinates: CellCoordinates) => {
    dispatch({type: SELECT_CELL, cellCoordinates});
  }, []);

  const showMenu = useCallback((showNotes?: boolean) => {
    dispatch({type: SHOW_MENU, showNotes});
  }, []);

  const hideMenu = useCallback(() => {
    dispatch({type: HIDE_MENU});
  }, []);

  const restartGame = useCallback(
    (sudokuIndex: number, sudokuCollectionName: string, timesSolved: number, previousTimes: number[]) => {
      dispatch({type: RESTART_GAME, sudokuIndex, sudokuCollectionName, timesSolved, previousTimes});
    },
    [],
  );

  const toggleShowHints = useCallback(() => {
    dispatch({type: TOGGLE_SHOW_HINTS});
  }, []);

  const toggleShowOccurrences = useCallback(() => {
    dispatch({type: TOGGLE_SHOW_OCCURRENCES});
  }, []);

  const toggleShowConflicts = useCallback(() => {
    dispatch({type: TOGGLE_SHOW_CONFLICTS});
  }, []);

  const toggleShowCircleMenu = useCallback(() => {
    dispatch({type: TOGGLE_SHOW_CIRCLE_MENU});
  }, []);

  const toggleShowWrongEntries = useCallback(() => {
    dispatch({type: TOGGLE_SHOW_WRONG_ENTRIES});
  }, []);

  const activateNotesMode = useCallback(() => {
    dispatch({type: ACTIVATE_NOTES_MODE});
  }, []);

  const deactivateNotesMode = useCallback(() => {
    dispatch({type: DEACTIVATE_NOTES_MODE});
  }, []);

  const updateTimer = useCallback((secondsPlayed: number) => {
    dispatch({type: UPDATE_TIMER, secondsPlayed});
  }, []);

  const resetGame = useCallback(() => {
    dispatch({type: RESET_GAME});
  }, []);

  const value = {
    state,
    newGame,
    setGameState,
    wonGame,
    pauseGame,
    continueGame,
    selectCell,
    showMenu,
    hideMenu,
    restartGame,
    toggleShowHints,
    toggleShowOccurrences,
    toggleShowConflicts,
    toggleShowCircleMenu,
    toggleShowWrongEntries,
    activateNotesMode,
    deactivateNotesMode,
    updateTimer,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
