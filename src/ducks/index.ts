import {combineReducers} from "redux";
import sudoku, {SudokuState} from "./sudoku";
import game, {GameState} from "./game";
import choose, {ChooseState} from "./game/choose";

const rootReducer = combineReducers({
  sudoku,
  game,
  choose,
});

export interface RootState {
  sudoku: SudokuState;
  game: GameState;
  choose: ChooseState;
}

export default rootReducer;
