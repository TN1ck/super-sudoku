import { combineReducers } from 'redux';
import counter from './counter';
import sudoku from './sudoku';

const rootReducer = combineReducers({
    counter: counter,
    sudoku: sudoku,
});

export default rootReducer;
