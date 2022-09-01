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
const SHOW_MENU = "game/SHOW_MENU";
const HIDE_MENU = "game/HIDE_MENU";
const SELECT_CELL = "game/SELECT_MENU";
const TOGGLE_SHOW_HINTS = "game/TOGGLE_SHOW_HINTS";
const TOGGLE_SHOW_CIRCLE_MENU = "game/TOGGLE_SHOW_CIRCLE_MENU";
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

export function toggleShowHints() {
  return {
    type: TOGGLE_SHOW_HINTS,
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
  offsetTime: number;
  showCircleMenu: boolean;
  showHints: boolean;
  showMenu: boolean;
  showNotes: boolean; // local overwrite
  state: GameStateMachine;
  sudokuId: number;
  sudokuIndex: number;
  won: boolean;
  secondsPlayed: number;
}

const INITIAL_GAME_STATE: GameState = {
  activeCellCoordinates: undefined,
  difficulty: DIFFICULTY.EASY,
  notesMode: false,
  offsetTime: 0,
  showCircleMenu: true,
  showHints: false,
  showMenu: false,
  showNotes: false,
  state: GameStateMachine.paused,
  sudokuId: -1,
  sudokuIndex: -1,
  secondsPlayed: 0,
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
    case TOGGLE_SHOW_HINTS: {
      return {
        ...state,
        showHints: !state.showHints,
      };
    }
    case TOGGLE_SHOW_CIRCLE_MENU: {
      return {
        ...state,
        showCircleMenu: !state.showCircleMenu,
      };
    }
    case NEW_GAME:
      return {
        ...INITIAL_GAME_STATE,
        sudokuId: action.sudokuId,
        sudokuIndex: action.sudokuIndex,
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
          return {
            ...state,
            state: GameStateMachine.paused,
          };
        }
        case GameStateMachine.running: {
          return {
            ...state,
            state: GameStateMachine.running,
          };
        }
        case GameStateMachine.wonGame: {
          return {
            ...state,
            state: GameStateMachine.wonGame,
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
      return {
        ...state,
        activeCellCoordinates: action.cellCoordinates,
      };
    case SHOW_MENU:
      return {
        ...state,
        showMenu: true,
        showNotes: action.showNotes,
      };
    case HIDE_MENU:
      return {
        ...state,
        showMenu: false,
        showNotes: false,
      };
    default:
      return state;
  }
}
