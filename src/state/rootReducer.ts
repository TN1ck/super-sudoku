import {AnyAction, combineReducers} from "redux";
import sudoku, {SudokuState, SET_SUDOKU, SET_SUDOKU_STATE} from "./sudoku";
import game, {GameState, SET_GAME_STATE, NEW_GAME, UPDATE_TIMER, GameStateMachine} from "./game";
import {saveToLocalStorage} from "src/sudoku-game/persistence";
import {throttle} from "lodash";

const rootReducer = (state: RootState, action: AnyAction) => {
  const gameState = game(state.game, action);
  // Only calculate sudoku state if not in the won state.
  const sudokuState = state.game?.state === GameStateMachine.wonGame ? state.sudoku : sudoku(state.sudoku, action);

  return {
    game: gameState,
    sudoku: sudokuState,
  };
};

const doNotPersistOnTheseActions = [
  // these actions are dependent on each other, if we don't skip them, we have inconsistent state
  SET_GAME_STATE,
  NEW_GAME,
  SET_SUDOKU,
  SET_SUDOKU_STATE,
];

export interface RootState {
  sudoku: SudokuState;
  game: GameState;
}

const throttledSaved = throttle(saveToLocalStorage, 1000);

const rootReducerWithPersistence = (state: RootState, action: AnyAction) => {
  state = rootReducer(state, action);
  if (state.application && state.game && state.sudoku && !doNotPersistOnTheseActions.includes(action.type)) {
    throttledSaved(state.application, state.game, state.sudoku);
  }
  return state;
};

export default rootReducerWithPersistence;
