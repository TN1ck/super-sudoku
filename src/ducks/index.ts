import {combineReducers} from "redux";
import sudoku, {SudokuState} from "./sudoku";
import game, {GameState} from "./game";

const rootReducer = combineReducers({
  sudoku,
  game,
});

export interface RootState {
  sudoku: SudokuState;
  game: GameState;
}

export default rootReducer;
