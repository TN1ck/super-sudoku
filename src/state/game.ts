import {AnyAction} from "redux";
import {CellCoordinates, DIFFICULTY} from "src/engine/types";

export enum GameStateMachine {
  running = "RUNNING",
  paused = "PAUSED",
  wonGame = "WON_GAME",
}

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

export function activateNotesMode() {
  return {
    type: ACTIVATE_NOTES_MODE,
  };
}

export function deactivateNotesMode() {
  return {
    type: DEACTIVATE_NOTES_MODE,
  };
}

export function newGame(sudokuId: number, sudokuIndex: number, difficulty: DIFFICULTY) {
  return {
    type: NEW_GAME,
    sudokuId,
    sudokuIndex,
    difficulty,
  };
}

export function updateTimer(secondsPlayed: number) {
  return {
    type: UPDATE_TIMER,
    secondsPlayed,
  };
}

export function wonGame() {
  return setGameStateMachine(GameStateMachine.wonGame);
}

export function pauseGame() {
  return setGameStateMachine(GameStateMachine.paused);
}

export function continueGame() {
  return setGameStateMachine(GameStateMachine.running);
}

export function selectCell(cellCoordinates: CellCoordinates) {
  return {
    type: SELECT_CELL,
    cellCoordinates,
  };
}

export function showMenu(showNotes?: boolean) {
  return {
    type: SHOW_MENU,
    showNotes,
  };
}

export function hideMenu() {
  return {
    type: HIDE_MENU,
  };
}

export function setGameStateMachine(state: GameStateMachine) {
  return {
    type: SET_GAME_STATE_MACHINE,
    state,
  };
}

export function restartGame(
  sudokuId: number,
  sudokuIndex: number,
  difficulty: DIFFICULTY,
  timesSolved: number,
  secondsPlayed: number,
  previousTimes: number[],
) {
  return {
    type: RESTART_GAME,
    sudokuId,
    sudokuIndex,
    difficulty,
    timesSolved,
    secondsPlayed,
    previousTimes,
  };
}

export function toggleShowHints() {
  return {
    type: TOGGLE_SHOW_HINTS,
  };
}

export function toggleShowOccurrences() {
  return {
    type: TOGGLE_SHOW_OCCURRENCES,
  };
}

export function toggleShowWrongEntries() {
  return {
    type: TOGGLE_SHOW_WRONG_ENTRIES,
  };
}

export function toggleShowConflicts() {
  return {
    type: TOGGLE_SHOW_CONFLICTS,
  };
}

export function toggleShowCircleMenu() {
  return {
    type: TOGGLE_SHOW_CIRCLE_MENU,
  };
}

export interface GameState {
  activeCellCoordinates?: CellCoordinates;
  difficulty: DIFFICULTY;
  notesMode: boolean; // global notes mode
  showCircleMenu: boolean;
  showHints: boolean;
  showMenu: boolean;
  showOccurrences: boolean;
  showWrongEntries: boolean;
  showConflicts: boolean;
  showNotes: boolean; // local overwrite
  state: GameStateMachine;
  sudokuId: number;
  sudokuIndex: number;
  won: boolean;
  timesSolved: number;
  previousTimes: number[];
  secondsPlayed: number;
}

const INITIAL_GAME_STATE: GameState = {
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

export function setGameState(state: GameState) {
  return {
    type: SET_GAME_STATE,
    state,
  };
}

export default function gameReducer(state: GameState = INITIAL_GAME_STATE, action: AnyAction): GameState {
  switch (action.type) {
    case SET_GAME_STATE:
      return action.state;
    case RESTART_GAME:
      return {
        ...INITIAL_GAME_STATE,
        sudokuId: action.sudokuId,
        sudokuIndex: action.sudokuIndex,
        difficulty: action.difficulty,
        secondsPlayed: 0,
        timesSolved: action.timesSolved,
        previousTimes: action.previousTimes,
      };
    case TOGGLE_SHOW_HINTS: {
      return {
        ...state,
        showHints: !state.showHints,
      };
    }
    case TOGGLE_SHOW_OCCURRENCES: {
      return {
        ...state,
        showOccurrences: !state.showOccurrences,
      };
    }
    case TOGGLE_SHOW_CIRCLE_MENU: {
      return {
        ...state,
        showCircleMenu: !state.showCircleMenu,
      };
    }
    case TOGGLE_SHOW_WRONG_ENTRIES: {
      return {
        ...state,
        showWrongEntries: !state.showWrongEntries,
      };
    }
    case TOGGLE_SHOW_CONFLICTS: {
      return {
        ...state,
        showConflicts: !state.showConflicts,
      };
    }
    case NEW_GAME:
      return {
        ...INITIAL_GAME_STATE,
        sudokuId: action.sudokuId,
        sudokuIndex: action.sudokuIndex,
        secondsPlayed: 0,
        difficulty: action.difficulty,
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

    case SET_GAME_STATE_MACHINE:
      switch (action.state) {
        case GameStateMachine.paused: {
          if (state.state === GameStateMachine.running) {
            return {
              ...state,
              state: GameStateMachine.paused,
            };
          }
          return state;
        }
        case GameStateMachine.running: {
          if (state.state === GameStateMachine.paused) {
            return {
              ...state,
              state: GameStateMachine.running,
            };
          }
          return state;
        }
        case GameStateMachine.wonGame: {
          return {
            ...state,
            state: GameStateMachine.wonGame,
            timesSolved: state.timesSolved + 1,
            previousTimes: [...state.previousTimes, state.secondsPlayed],
          };
        }
        default: {
          return {
            ...state,
            state: action.state,
          };
        }
      }
    case SELECT_CELL:
      if (state.state === GameStateMachine.wonGame) {
        return state;
      }
      return {
        ...state,
        activeCellCoordinates: action.cellCoordinates,
      };
    case SHOW_MENU:
      if (state.state === GameStateMachine.wonGame) {
        return state;
      }
      return {
        ...state,
        showMenu: true,
        showNotes: action.showNotes,
      };
    case HIDE_MENU:
      if (state.state === GameStateMachine.wonGame) {
        return state;
      }
      return {
        ...state,
        showMenu: false,
        showNotes: false,
      };
    default:
      return state;
  }
}
