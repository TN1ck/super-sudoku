import {CellCoordinates} from "src/engine/types";

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

export function newGame(sudokuId: number, sudokuIndex: number) {
  return {
    type: NEW_GAME,
    sudokuId: sudokuId,
    sudokuIndex: sudokuIndex,
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
  sudokuId: number;
  sudokuIndex: number;
  startTime: number;
  offsetTime: number;
  stopTime: number;
  state: GameStateMachine;
  // menu stuff
  activeCellCoordinates: CellCoordinates;
  showHints: boolean;
  showCircleMenu: boolean;
  showMenu: boolean;
  won: boolean;
  notesMode: boolean; // global notes mode
  showNotes: boolean; // local overwrite
}

const INITIAL_GAME_STATE: GameState = {
  sudokuId: -1,
  sudokuIndex: -1,
  won: false,
  showMenu: false,
  showCircleMenu: true,
  startTime: 0,
  offsetTime: 0,
  stopTime: 0,
  // menu stuff
  state: GameStateMachine.paused,
  activeCellCoordinates: null,
  showHints: false,
  notesMode: false,
  showNotes: false,
};

export function setGameState(state: GameState) {
  return {
    type: SET_GAME_STATE,
    state,
  };
}

export function getTime(startTime: number, offsetTime: number, stopTime: number) {
  const now = +new Date();
  if (startTime === 0) {
    return 0;
  }
  if (stopTime !== 0) {
    return Math.floor(stopTime - startTime - offsetTime);
  }
  return Math.floor(now - startTime - offsetTime);
}

export default function gameReducer(state: GameState = INITIAL_GAME_STATE, action): GameState {
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

    case SET_GAME_STATE_MACHINE:
      switch (action.state) {
        case GameStateMachine.paused: {
          return {
            ...state,
            stopTime: +new Date(),
            state: GameStateMachine.paused,
          };
        }
        case GameStateMachine.running: {
          let offsetTime = state.offsetTime;
          let startTime = state.startTime;
          if (state.startTime === 0) {
            startTime = +new Date();
          }
          if (state.stopTime > 0) {
            offsetTime = state.offsetTime + (+new Date() - state.stopTime);
          }
          return {
            ...state,
            state: GameStateMachine.running,
            startTime,
            offsetTime,
            stopTime: 0,
          };
        }
        case GameStateMachine.wonGame: {
          return {
            ...state,
            stopTime: +new Date(),
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
