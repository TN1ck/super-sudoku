import configureStore from "./configureStore";
import {getState} from "src/sudoku-game/persistence";
import {RootState} from "./rootReducer";
import {initialChooseState as INITIAL_CHOOSE_STATE} from "./choose";
import {INITIAL_GAME_STATE} from "./game";
import {INITIAL_SUDOKU_STATE} from "./sudoku";
import {INITIAL_APPLICATION_STATE} from "./application";

const savedState = getState();
const currentSudoku = savedState.sudokus[savedState.active];
const initialState: RootState = {
  game: currentSudoku ? currentSudoku.game : INITIAL_GAME_STATE,
  sudoku: currentSudoku
    ? {
        history: [],
        historyIndex: 0,
        current: currentSudoku.sudoku,
      }
    : INITIAL_SUDOKU_STATE,
  application: savedState.application ?? INITIAL_APPLICATION_STATE,
  choose: INITIAL_CHOOSE_STATE,
};
const store = configureStore(initialState);
export default store;
