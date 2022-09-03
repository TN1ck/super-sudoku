import {AnyAction, combineReducers} from "redux";
import sudoku, {SudokuState, SET_SUDOKU, SET_SUDOKU_STATE} from "./sudoku";
import game, {GameState, SET_GAME_STATE, NEW_GAME, UPDATE_TIMER} from "./game";
import application, {ApplicationState} from "./application";
import choose, {ChooseState} from "./choose";
import {saveToLocalStorage} from "src/sudoku-game/persistence";
import {throttle} from "lodash";

const rootReducer = combineReducers({
  sudoku,
  game,
  choose,
  application,
});

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
    console.log(state.game.sudokuId);
    throttledSaved(state.application, state.game, state.sudoku);
  }
  return state;
};

export default rootReducerWithPersistence;
