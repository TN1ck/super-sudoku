import configureStore from "./configureStore";
import {getState} from "src/sudoku-game/persistence";
import {RootState} from "./rootReducer";
import {initialChooseState} from "./choose";

const savedState = getState();
const currentSudoku = savedState.sudokus[savedState.active];
console.log("currentSudoku", currentSudoku.game.sudokuId);
const initialState: RootState = {
  game: currentSudoku ? currentSudoku.game : undefined,
  sudoku: currentSudoku ? currentSudoku.sudoku : undefined,
  application: savedState.application,
  choose: initialChooseState,
};
const store = configureStore(initialState);
export default store;
