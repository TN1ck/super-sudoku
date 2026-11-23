import React, {createContext, ReactNode, useCallback, useContext, useMemo, useReducer} from "react";
import {CellCoordinates} from "src/lib/engine/types";
import {START_SUDOKU_COLLECTION, START_SUDOKU_INDEX} from "src/lib/game/sudokus";

export enum GameStateMachine {
  running = "RUNNING",
  paused = "PAUSED",
}

export interface GameState {
  activeCellCoordinates?: CellCoordinates;
  sudokuCollectionName: string;
  notesMode: boolean;
  showNotes: boolean;
  showMenu: boolean;
  state: GameStateMachine;
  sudokuIndex: number;
  won: boolean;
  timesSolved: number;
  previousTimes: number[];
  secondsPlayed: number;
  clipboardNotes: number[] | null;
}

export const INITIAL_GAME_STATE: GameState = {
  activeCellCoordinates: undefined,
  sudokuCollectionName: START_SUDOKU_COLLECTION.name,
  notesMode: false,
  showMenu: false,
  showNotes: false,
  state: GameStateMachine.paused,
  sudokuIndex: START_SUDOKU_INDEX,
  secondsPlayed: 0,
  timesSolved: 0,
  previousTimes: [],
  won: false,
  clipboardNotes: null,
};

// Action types
const NEW_GAME = "game/NEW_GAME";
const WON_GAME = "game/WON_GAME";
const PAUSE_GAME = "game/PAUSE_GAME";
const CONTINUE_GAME = "game/CONTINUE_GAME";
const SET_GAME_STATE = "game/SET_GAME_STATE";
const SHOW_MENU = "game/SHOW_MENU";
const HIDE_MENU = "game/HIDE_MENU";
const SELECT_CELL = "game/SELECT_CELL";
const ACTIVATE_NOTES_MODE = "game/ACTIVATE_NOTES_MODE";
const DEACTIVATE_NOTES_MODE = "game/DEACTIVATE_NOTES_MODE";
const UPDATE_TIMER = "game/UPDATE_TIME";
const RESET_GAME = "game/RESET_GAME";
const COPY_NOTES = "game/COPY_NOTES";

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
  | {type: typeof SHOW_MENU; showNotes?: boolean}
  | {type: typeof HIDE_MENU}
  | {type: typeof SELECT_CELL; cellCoordinates: CellCoordinates}
  | {type: typeof ACTIVATE_NOTES_MODE}
  | {type: typeof DEACTIVATE_NOTES_MODE}
  | {type: typeof UPDATE_TIMER}
  | {type: typeof RESET_GAME}
  | {type: typeof WON_GAME}
  | {type: typeof COPY_NOTES; notes: number[]};

export function createNewGameState({
  sudokuIndex,
  sudokuCollectionName,
  timesSolved,
  previousTimes,
}: Pick<GameState, "sudokuIndex" | "sudokuCollectionName" | "timesSolved" | "previousTimes">): GameState {
  return {
    ...INITIAL_GAME_STATE,
    sudokuIndex,
    sudokuCollectionName,
    timesSolved,
    previousTimes,
    state: GameStateMachine.running,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case SET_GAME_STATE:
      return action.state;
    case NEW_GAME:
      return createNewGameState(action);
    case WON_GAME: {
      if (state.won && state.state === GameStateMachine.paused) {
        return state;
      }
      const justWon = state.won === false;
      return {
        ...state,
        won: true,
        state: GameStateMachine.paused,
        showMenu: false,
        showNotes: false,
        timesSolved: justWon ? state.timesSolved + 1 : state.timesSolved,
        previousTimes: justWon ? [...state.previousTimes, state.secondsPlayed] : state.previousTimes,
      };
    }
    case PAUSE_GAME:
      if (state.state === GameStateMachine.paused) {
        return state;
      }
      return {
        ...state,
        state: GameStateMachine.paused,
      };
    case CONTINUE_GAME:
      // You can't continue a game that is won.
      if (state.won || state.state === GameStateMachine.running) {
        return state;
      }
      return {
        ...state,
        state: GameStateMachine.running,
      };
    case SHOW_MENU: {
      const nextShowNotes = Boolean(action.showNotes);
      if (state.showMenu && state.showNotes === nextShowNotes) {
        return state;
      }
      return {
        ...state,
        showMenu: true,
        showNotes: nextShowNotes,
      };
    }
    case HIDE_MENU:
      if (!state.showMenu && !state.showNotes) {
        return state;
      }
      return {
        ...state,
        showMenu: false,
        showNotes: false,
      };
    case SELECT_CELL:
      if (
        state.activeCellCoordinates?.x === action.cellCoordinates.x &&
        state.activeCellCoordinates?.y === action.cellCoordinates.y
      ) {
        return state;
      }
      return {
        ...state,
        activeCellCoordinates: {x: action.cellCoordinates.x, y: action.cellCoordinates.y},
      };
    case ACTIVATE_NOTES_MODE:
      if (state.notesMode) {
        return state;
      }
      return {
        ...state,
        notesMode: true,
      };
    case DEACTIVATE_NOTES_MODE:
      if (!state.notesMode) {
        return state;
      }
      return {
        ...state,
        notesMode: false,
      };
    case UPDATE_TIMER:
      return state;
    case RESET_GAME:
      return {
        ...state,
        secondsPlayed: 0,
        state: GameStateMachine.running,
        won: false,
        showMenu: false,
        showNotes: false,
        clipboardNotes: null,
      };
    case COPY_NOTES:
      return {
        ...state,
        clipboardNotes: action.notes,
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
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
  updateTimer: () => void;
  resetGame: () => void;
  copyNotes: (notes: number[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  initialState?: GameState;
}

export function GameProvider({children, initialState = INITIAL_GAME_STATE}: GameProviderProps) {
  const [{game: state}, dispatchTimed] = useReducer(
    (session: {game: GameState; at: number}, {action, at}: {action: GameAction; at: number}) => {
      const {game} = session;
      // Account for play up to the action itself, including the final fraction before a pause or win.
      const elapsed = game.state === GameStateMachine.running ? Math.max(0, at - session.at) : 0;
      const current = elapsed
        ? {...game, secondsPlayed: (Math.round(game.secondsPlayed * 1000) + elapsed) / 1000}
        : game;
      const nextGame = gameReducer(current, action);
      if (nextGame === game) {
        return session;
      }
      return {game: nextGame, at};
    },
    initialState,
    (game) => ({game, at: Date.now()}),
  );
  const dispatch = useCallback((action: GameAction) => dispatchTimed({action, at: Date.now()}), []);

  const newGame = useCallback(
    (sudokuIndex: number, sudokuCollectionName: string, timesSolved: number, previousTimes: number[]) => {
      dispatch({type: NEW_GAME, sudokuIndex, sudokuCollectionName, timesSolved, previousTimes});
    },
    [dispatch],
  );

  const setGameState = useCallback(
    (gameState: GameState) => {
      dispatch({type: SET_GAME_STATE, state: gameState});
    },
    [dispatch],
  );

  const wonGame = useCallback(() => {
    dispatch({type: WON_GAME});
  }, [dispatch]);

  const pauseGame = useCallback(() => {
    dispatch({type: PAUSE_GAME});
  }, [dispatch]);

  const continueGame = useCallback(() => {
    dispatch({type: CONTINUE_GAME});
  }, [dispatch]);

  const selectCell = useCallback(
    (cellCoordinates: CellCoordinates) => {
      dispatch({type: SELECT_CELL, cellCoordinates});
    },
    [dispatch],
  );

  const showMenu = useCallback(
    (showNotes?: boolean) => {
      dispatch({type: SHOW_MENU, showNotes});
    },
    [dispatch],
  );

  const hideMenu = useCallback(() => {
    dispatch({type: HIDE_MENU});
  }, [dispatch]);

  const activateNotesMode = useCallback(() => {
    dispatch({type: ACTIVATE_NOTES_MODE});
  }, [dispatch]);

  const deactivateNotesMode = useCallback(() => {
    dispatch({type: DEACTIVATE_NOTES_MODE});
  }, [dispatch]);

  const updateTimer = useCallback(() => {
    dispatch({type: UPDATE_TIMER});
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({type: RESET_GAME});
  }, [dispatch]);

  const copyNotes = useCallback(
    (notes: number[]) => {
      dispatch({type: COPY_NOTES, notes});
    },
    [dispatch],
  );

  const value = useMemo(
    () => ({
      state,
      newGame,
      setGameState,
      wonGame,
      pauseGame,
      continueGame,
      selectCell,
      showMenu,
      hideMenu,
      activateNotesMode,
      deactivateNotesMode,
      updateTimer,
      resetGame,
      copyNotes,
    }),
    [
      state,
      newGame,
      setGameState,
      wonGame,
      pauseGame,
      continueGame,
      selectCell,
      showMenu,
      hideMenu,
      activateNotesMode,
      deactivateNotesMode,
      updateTimer,
      resetGame,
      copyNotes,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
