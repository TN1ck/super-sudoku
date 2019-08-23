import configureStore from "./configureStore";
import {getState} from "src/sudoku-game/persistence";

const savedState = getState();
const currentSudoku = savedState.sudokus[savedState.active];
const initialState = {
  game: currentSudoku ? currentSudoku.game : undefined,
  sudoku: currentSudoku ? currentSudoku.sudoku : undefined,
  application: savedState.application,
};
const store = configureStore(initialState);
export default store;
