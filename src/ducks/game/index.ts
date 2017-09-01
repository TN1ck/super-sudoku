import { DIFFICULTY } from 'src/engine/utility';
import sudokus from 'src/sudokus';

const NEW_GAME = 'game/NEW_GAME';
const RESET_GAME = 'game/RESET_GAME';
const PAUSE_GAME = 'game/PAUSE_GAME';
const CONTINUE_GAME = 'game/CONTINUE_GAME';
const CHANGE_INDEX = 'game/CHANGE_INDEX';
const SET_MENU = 'game/SET_MENU';
const SET_DIFFICULTY = 'game/SET_DIFFICULTY';

export function newGame(difficulty, sudokuId) {
  return {
    type: NEW_GAME,
    difficulty,
    sudokuId,
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

export function setMenu(menu) {
  return {
    type: SET_MENU,
    menu,
  };
}

export function setDifficulty(difficulty) {
  return {
    type: SET_DIFFICULTY,
    difficulty,
  };
}

export interface GameState {
  startTime: number;
  offsetTime: number;
  stopTime: number;
  running: boolean;
  currentlySelectedDifficulty: string;
  currentlySelectedSudokuId: string;
  sudokus: typeof sudokus;
  // menu stuff
  sudokuIndex: number;
  menu: string;
  difficulty: DIFFICULTY;
}

const gameState: GameState = {
  startTime: 0,
  offsetTime: 0,
  stopTime: 0,
  running: false,
  currentlySelectedDifficulty: undefined,
  currentlySelectedSudokuId: undefined,
  sudokus,
  // menu stuff
  sudokuIndex: 0,
  menu: 'INITIAL',
  difficulty: undefined,
};

export function getTime(
  startTime: number,
  offsetTime: number,
  stopTime: number,
) {
  const now = +new Date();
  if (startTime === 0) {
    return 0;
  }
  if (stopTime !== 0) {
    return Math.floor(stopTime - startTime - offsetTime);
  }
  return Math.floor(now - startTime - offsetTime);
}

export default function gameReducer(
  state: GameState = gameState,
  action,
): GameState {
  switch (action.type) {
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
        running: false,
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
        running: true,
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
    case SET_MENU:
      return {
        ...state,
        menu: action.menu,
      };
    default:
      return state;
  }
}
