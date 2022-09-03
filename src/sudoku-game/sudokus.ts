import {SimpleSudoku} from "src/engine/types";
import sudokus from "../../sudokus.json";

export interface SudokuRaw {
  iterations: number;
  sudoku: SimpleSudoku;
  solution: SimpleSudoku;
  id: number;
}

const SUDOKUS: {
  easy: SudokuRaw[];
  medium: SudokuRaw[];
  hard: SudokuRaw[];
  expert: SudokuRaw[];
  evil: SudokuRaw[];
} = sudokus;

export default SUDOKUS;
