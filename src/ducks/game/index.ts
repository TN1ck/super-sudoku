import {DIFFICULTY} from "src/engine/utility";
import sudokus from "src/sudokus";
import {Cell} from "src/ducks/sudoku/model";

export enum GameStateMachine {
  running = "RUNNING",
  paused = "PAUSED",
  chooseGame = "CHOOSE_GAME",
  wonGame = "WON_GAME",
}

const NEW_GAME = "game/NEW_GAME";
const RESET_GAME = "game/RESET_GAME";
const PAUSE_GAME = "game/PAUSE_GAME";
const CONTINUE_GAME = "game/CONTINUE_GAME";
const WON_GAME = "game/WON_GAME";

const CHANGE_INDEX = "game/CHANGE_INDEX";
const SET_MENU = "game/SET_MENU";
const SET_DIFFICULTY = "game/SET_DIFFICULTY";
const SHOW_MENU = "game/SHOW_MENU";
const HIDE_MENU = "game/HIDE_MENU";
const SELECT_CELL = "game/SELECT_MENU";
const TOGGLE_SHOW_HINTS = "game/TOGGLE_SHOW_HINTS";

export function newGame(difficulty, sudokuId) {
  return {
    type: NEW_GAME,
    difficulty,
    sudokuId,
  };
}

export function wonGame() {
  return {
    type: WON_GAME,
  };
}

export function resetGame() {
  return {
    type: RESET_GAME,
  };
}

export function pauseGame() {
  return {
    type: PAUSE_GAME,
  };
}

export function continueGame() {
  return {
    type: CONTINUE_GAME,
  };
}

export function changeIndex(index) {
  return {
    type: CHANGE_INDEX,
    index,
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
    type: SET_MENU,
    state,
  };
}

export function setDifficulty(difficulty) {
  return {
    type: SET_DIFFICULTY,
    difficulty,
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
  currentlySelectedDifficulty: string;
  currentlySelectedSudokuId: string;
  sudokus: typeof sudokus;
  state: GameStateMachine;
  // menu stuff
  sudokuIndex: number;
  difficulty: DIFFICULTY;
  activeCell: Cell;
  showHints: boolean;
  showMenu: boolean;
  won: boolean;
}

const gameState: GameState = {
  won: false,
  showMenu: false,
  startTime: 0,
  offsetTime: 0,
  stopTime: 0,
  currentlySelectedDifficulty: undefined,
  currentlySelectedSudokuId: undefined,
  sudokus,
  // menu stuff
  sudokuIndex: 0,
  state: GameStateMachine.chooseGame,
  difficulty: DIFFICULTY.EASY,
  activeCell: null,
  showHints: false,
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
        currentlySelectedDifficulty: action.difficulty,
        currentlySelectedSudokuId: action.sudokuId,
      };
    case PAUSE_GAME:
      return {
        ...state,
        stopTime: +new Date(),
        state: GameStateMachine.paused,
      };
    case CONTINUE_GAME:
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
    case RESET_GAME:
      return {
        ...gameState,
      };
    case CHANGE_INDEX:
      return {
        ...state,
        sudokuIndex: action.index,
      };
    case SET_DIFFICULTY:
      return {
        ...state,
        difficulty: action.difficulty,
      };
    case WON_GAME: {
      return {
        ...state,
        state: GameStateMachine.wonGame,
      };
    }
    case SET_MENU:
      return {
        ...state,
        state: action.state,
      };
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
