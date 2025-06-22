import configureStore from "./configureStore";
import {getState} from "src/sudoku-game/persistence";
import {RootState} from "./rootReducer";
import {INITIAL_GAME_STATE} from "./game";
import {INITIAL_SUDOKU_STATE} from "./sudoku";

const savedState = getState();
const currentSudoku = savedState.sudokus[savedState.active];
const initialState: RootState = {
  game: currentSudoku ? currentSudoku.game : INITIAL_GAME_STATE,
  sudoku: currentSudoku
    ? {
        history: [currentSudoku.sudoku],
        historyIndex: 0,
        current: currentSudoku.sudoku,
      }
    : INITIAL_SUDOKU_STATE,
};
const store = configureStore(initialState);
export default store;
