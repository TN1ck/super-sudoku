import React, {createContext, useContext, useReducer, useCallback, ReactNode} from "react";
import {CellCoordinates, DIFFICULTY} from "src/engine/types";
import {saveToLocalStorage} from "src/sudoku-game/persistence";
import {throttle} from "lodash";

export enum GameStateMachine {
  running = "RUNNING",
  paused = "PAUSED",
  wonGame = "WON_GAME",
}

export interface GameState {
  activeCellCoordinates?: CellCoordinates;
  difficulty: DIFFICULTY;
  notesMode: boolean;
  showCircleMenu: boolean;
  showHints: boolean;
  showMenu: boolean;
  showOccurrences: boolean;
  showWrongEntries: boolean;
  showConflicts: boolean;
  showNotes: boolean;
  state: GameStateMachine;
  sudokuId: number;
  sudokuIndex: number;
  won: boolean;
  timesSolved: number;
  previousTimes: number[];
  secondsPlayed: number;
}

export const INITIAL_GAME_STATE: GameState = {
  activeCellCoordinates: undefined,
  difficulty: DIFFICULTY.EASY,
  notesMode: false,
  showCircleMenu: true,
  showHints: false,
  showConflicts: true,
  showOccurrences: false,
  showWrongEntries: false,
  showMenu: false,
  showNotes: false,
  state: GameStateMachine.paused,
  sudokuId: -1,
  sudokuIndex: -1,
  secondsPlayed: 0,
  timesSolved: 0,
  previousTimes: [],
  won: false,
};

// Action types
export const NEW_GAME = "game/NEW_GAME";
export const SET_GAME_STATE = "game/SET_GAME_STATE";
const SET_GAME_STATE_MACHINE = "game/SET_GAME_STATE_MACHINE";
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
export const UPDATE_TIMER = "game/UPDATE_TIME";
const RESET_GAME = "game/RESET_GAME";

type GameAction =
  | {type: typeof NEW_GAME; sudokuId: number; sudokuIndex: number; difficulty: DIFFICULTY}
  | {type: typeof SET_GAME_STATE; state: GameState}
  | {type: typeof SET_GAME_STATE_MACHINE; state: GameStateMachine}
  | {
      type: typeof RESTART_GAME;
      sudokuId: number;
      sudokuIndex: number;
      difficulty: DIFFICULTY;
      timesSolved: number;
      secondsPlayed: number;
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
  | {type: typeof RESET_GAME};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case SET_GAME_STATE:
      return action.state;
    case NEW_GAME:
      return {
        ...INITIAL_GAME_STATE,
        sudokuId: action.sudokuId,
        sudokuIndex: action.sudokuIndex,
        difficulty: action.difficulty,
        state: GameStateMachine.running,
      };
    case SET_GAME_STATE_MACHINE:
      return {
        ...state,
        state: action.state,
        won: action.state === GameStateMachine.wonGame,
      };
    case RESTART_GAME:
      return {
        ...state,
        sudokuId: action.sudokuId,
        sudokuIndex: action.sudokuIndex,
        difficulty: action.difficulty,
        timesSolved: action.timesSolved,
        secondsPlayed: action.secondsPlayed,
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
  newGame: (sudokuId: number, sudokuIndex: number, difficulty: DIFFICULTY) => void;
  setGameState: (state: GameState) => void;
  wonGame: () => void;
  pauseGame: () => void;
  continueGame: () => void;
  selectCell: (cellCoordinates: CellCoordinates) => void;
  showMenu: (showNotes?: boolean) => void;
  hideMenu: () => void;
  restartGame: (
    sudokuId: number,
    sudokuIndex: number,
    difficulty: DIFFICULTY,
    timesSolved: number,
    secondsPlayed: number,
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

const throttledSave = throttle(saveToLocalStorage, 1000);

interface GameProviderProps {
  children: ReactNode;
  initialState?: GameState;
}

export function GameProvider({children, initialState = INITIAL_GAME_STATE}: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const newGame = useCallback((sudokuId: number, sudokuIndex: number, difficulty: DIFFICULTY) => {
    dispatch({type: NEW_GAME, sudokuId, sudokuIndex, difficulty});
  }, []);

  const setGameState = useCallback((gameState: GameState) => {
    dispatch({type: SET_GAME_STATE, state: gameState});
  }, []);

  const wonGame = useCallback(() => {
    dispatch({type: SET_GAME_STATE_MACHINE, state: GameStateMachine.wonGame});
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({type: SET_GAME_STATE_MACHINE, state: GameStateMachine.paused});
  }, []);

  const continueGame = useCallback(() => {
    dispatch({type: SET_GAME_STATE_MACHINE, state: GameStateMachine.running});
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
    (
      sudokuId: number,
      sudokuIndex: number,
      difficulty: DIFFICULTY,
      timesSolved: number,
      secondsPlayed: number,
      previousTimes: number[],
    ) => {
      dispatch({type: RESTART_GAME, sudokuId, sudokuIndex, difficulty, timesSolved, secondsPlayed, previousTimes});
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
