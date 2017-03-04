import { combineReducers } from 'redux';
import sudoku from './sudoku';

const rootReducer = combineReducers({
    sudoku: sudoku
});

export default rootReducer;
