import {DIFFICULTY} from "src/engine/utility";
import SUDOKUS from "src/assets/sudokus";

const SET_DIFFICULTY = "choose/SET_DIFFICULTY";
const NEXT_SUDOKU = "choose/NEXT_SUDOKU";
const PREVIOUS_SUDOKU = "choose/PREVIOUS_SUDOKU";
const CHANGE_SUDOKU = "choose/CHANGE_SUDOKU";

export function newGame(difficulty, sudokuId) {
  return {
    difficulty,
    sudokuId,
  };
}

export function nextSudoku() {
  return {
    type: NEXT_SUDOKU,
  };
}

export function previousSudoku() {
  return {
    type: PREVIOUS_SUDOKU,
  };
}

export function changeSudoku(index) {
  return {
    type: CHANGE_SUDOKU,
    index,
  };
}

export function setDifficulty(difficulty) {
  return {
    type: SET_DIFFICULTY,
    difficulty,
  };
}

export interface ChooseState {
  sudokuIndex: number;
  difficulty: DIFFICULTY;
}

const initialState: ChooseState = {
  sudokuIndex: 0,
  difficulty: DIFFICULTY.EASY,
};

export default function chooseReducer(state: ChooseState = initialState, action): ChooseState {
  const currentSudokus = SUDOKUS[state.difficulty];
  switch (action.type) {
    case NEXT_SUDOKU:
      return {
        ...state,
        sudokuIndex: (state.sudokuIndex + 1) % currentSudokus.length,
      };
    case PREVIOUS_SUDOKU:
      return {
        ...state,
        sudokuIndex: (state.sudokuIndex - 1 + currentSudokus.length) % currentSudokus.length,
      };
    case CHANGE_SUDOKU:
      return {
        ...state,
        sudokuIndex: (action.index + currentSudokus.length) % currentSudokus.length,
      };
    case SET_DIFFICULTY:
      return {
        ...state,
        difficulty: action.difficulty,
      };
    default:
      return state;
  }
}
