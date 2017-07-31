import {combineReducers} from 'redux';
import sudoku from './sudoku';
import game from './game';

const rootReducer = combineReducers({
  sudoku,
  game,
});

export default rootReducer;
