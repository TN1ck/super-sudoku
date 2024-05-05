import {AnyAction, combineReducers} from "redux";
import sudoku, {SudokuState, SET_SUDOKU, SET_SUDOKU_STATE} from "./sudoku";
import game, {GameState, SET_GAME_STATE, NEW_GAME, UPDATE_TIMER, GameStateMachine} from "./game";
import application, {ApplicationState} from "./application";
import choose, {ChooseState} from "./choose";
import {saveToLocalStorage} from "src/sudoku-game/persistence";
import {throttle} from "lodash";

const rootReducer = (state: RootState, action: AnyAction) => {
  const applicationState = application(state.application, action as any);
  const gameState = game(state.game, action);
  const chooseState = choose(state.choose, action);
  // Only calculate sudoku state if not in the won state.
  const sudokuState = state.game?.state === GameStateMachine.wonGame ? state.sudoku : sudoku(state.sudoku, action);

  return {
    application: applicationState,
    game: gameState,
    choose: chooseState,
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
  choose: ChooseState;
  application: ApplicationState;
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
