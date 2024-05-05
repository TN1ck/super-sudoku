import {UnknownAction} from "redux";
import {DIFFICULTY} from "src/engine/types";
import SUDOKUS from "src/sudoku-game/sudokus";

const SET_DIFFICULTY = "choose/SET_DIFFICULTY";
const NEXT_SUDOKU = "choose/NEXT_SUDOKU";
const PREVIOUS_SUDOKU = "choose/PREVIOUS_SUDOKU";
const CHANGE_SUDOKU = "choose/CHANGE_SUDOKU";

export function nextSudoku() {
  return {
    type: NEXT_SUDOKU,
  } as const; // Add 'as const' to make TypeScript infer the exact action type
}
type NextSudokuAction = ReturnType<typeof nextSudoku>;
function isNextSudokuAction(action: UnknownAction): action is NextSudokuAction {
  return action.type === NEXT_SUDOKU;
}

export function previousSudoku() {
  return {
    type: PREVIOUS_SUDOKU,
  } as const; // Add 'as const'
}
type PreviousSudokuAction = ReturnType<typeof previousSudoku>;
function isPreviousSudokuAction(action: UnknownAction): action is PreviousSudokuAction {
  return action.type === PREVIOUS_SUDOKU;
}

export function changeSudoku(index: number) {
  return {
    type: CHANGE_SUDOKU,
    index,
  } as const; // Add 'as const'
}
type ChangeSudokuAction = ReturnType<typeof changeSudoku>;
function isChangeSudokuAction(action: UnknownAction): action is ChangeSudokuAction {
  return action.type === CHANGE_SUDOKU;
}

export function setDifficulty(difficulty: DIFFICULTY) {
  return {
    type: SET_DIFFICULTY,
    difficulty,
  } as const; // Add 'as const'
}
type SetDifficultyAction = ReturnType<typeof setDifficulty>;
function isSetDifficultyAction(action: UnknownAction): action is SetDifficultyAction {
  return action.type === SET_DIFFICULTY;
}

export interface ChooseState {
  sudokuIndex: number;
  difficulty: DIFFICULTY;
}

export const initialChooseState: ChooseState = {
  sudokuIndex: 0,
  difficulty: DIFFICULTY.EASY,
};

export default function chooseReducer(state: ChooseState = initialChooseState, action: UnknownAction): ChooseState {
  const currentSudokus = SUDOKUS[state.difficulty];
  if (isNextSudokuAction(action)) {
    return {
      ...state,
      sudokuIndex: (state.sudokuIndex + 1) % currentSudokus.length,
    };
  }

  if (isPreviousSudokuAction(action)) {
    return {
      ...state,
      sudokuIndex: (state.sudokuIndex - 1 + currentSudokus.length) % currentSudokus.length,
    };
  }

  if (isChangeSudokuAction(action)) {
    return {
      ...state,
      sudokuIndex: (action.index + currentSudokus.length) % currentSudokus.length,
    };
  }

  if (isSetDifficultyAction(action)) {
    return {
      ...state,
      difficulty: action.difficulty,
    };
  }

  return state;
}
