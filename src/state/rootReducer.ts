import {combineReducers} from "redux";
import sudoku, {SudokuState, SET_SUDOKU, SET_SUDOKU_STATE} from "./sudoku";
import game, {GameState, SET_GAME_STATE, NEW_GAME} from "./game";
import choose, {ChooseState} from "./choose";
import {saveToLocalStorage} from "src/sudoku-game/persistence";

const rootReducer = combineReducers({
  sudoku,
  game,
  choose,
});

const doNotPersistOnTheseActions = [
  // these actions are dependent on each other, if we don't skip them, we have inconsistent state
  SET_GAME_STATE,
  NEW_GAME,
  SET_SUDOKU,
  SET_SUDOKU_STATE,
];
const persistReducer = (state, action) => {
  if (state.game && state.sudoku && !doNotPersistOnTheseActions.includes(action.type)) {
    saveToLocalStorage(state.game, state.sudoku);
  }
  return rootReducer(state, action);
};

export interface RootState {
  sudoku: SudokuState;
  game: GameState;
  choose: ChooseState;
}

export default persistReducer;
