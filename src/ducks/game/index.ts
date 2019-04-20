import {Cell} from "src/engine/utility";

export enum GameStateMachine {
  running = "RUNNING",
  paused = "PAUSED",
  chooseGame = "CHOOSE_GAME",
  wonGame = "WON_GAME",
  settings = "SETTINGS",
}

const NEW_GAME = "game/NEW_GAME";
const RESET_GAME = "game/RESET_GAME";

const SET_GAME_STATE = "game/SET_GAME_STATE";
const SHOW_MENU = "game/SHOW_MENU";
const HIDE_MENU = "game/HIDE_MENU";
const SELECT_CELL = "game/SELECT_MENU";
const TOGGLE_SHOW_HINTS = "game/TOGGLE_SHOW_HINTS";
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

export function newGame() {
  return setGameState(GameStateMachine.running);
}

export function wonGame() {
  return setGameState(GameStateMachine.wonGame);
}

export function pauseGame() {
  return setGameState(GameStateMachine.paused);
}

export function continueGame() {
  return setGameState(GameStateMachine.running);
}

export function chooseGame() {
  return setGameState(GameStateMachine.chooseGame);
}

export function activateSettings() {
  return setGameState(GameStateMachine.settings);
}

export function resetGame() {
  return {
    type: RESET_GAME,
  };
}

export function selectCell(cell) {
  return {
    type: SELECT_CELL,
    cell,
  };
}

export function showMenu() {
  return {
    type: SHOW_MENU,
  };
}

export function hideMenu() {
  return {
    type: HIDE_MENU,
  };
}

export function setGameState(state) {
  return {
    type: SET_GAME_STATE,
    state,
  };
}

export function toggleShowHints() {
  return {
    type: TOGGLE_SHOW_HINTS,
  };
}

export interface GameState {
  startTime: number;
  offsetTime: number;
  stopTime: number;
  state: GameStateMachine;
  // menu stuff
  activeCell: Cell;
  showHints: boolean;
  showMenu: boolean;
  won: boolean;
  notesMode: boolean;
}

const gameState: GameState = {
  won: false,
  showMenu: false,
  startTime: 0,
  offsetTime: 0,
  stopTime: 0,
  // menu stuff
  state: GameStateMachine.chooseGame,
  activeCell: null,
  showHints: false,
  notesMode: false,
};

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

export default function gameReducer(state: GameState = gameState, action): GameState {
  switch (action.type) {
    case TOGGLE_SHOW_HINTS: {
      return {
        ...state,
        showHints: !state.showHints,
      };
    }
    case NEW_GAME:
      return {
        ...state,
        state: GameStateMachine.running,
      };

    case RESET_GAME:
      return {
        ...gameState,
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

    case SET_GAME_STATE:
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
        activeCell: action.cell,
      };
    case SHOW_MENU:
      return {
        ...state,
        showMenu: true,
      };
    case HIDE_MENU:
      return {
        ...state,
        showMenu: false,
      };
    default:
      return state;
  }
}
