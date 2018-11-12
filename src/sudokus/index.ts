import {DIFFICULTY} from "src/engine/utility";
import sudokus from "src/assets/sudokus.ts";

interface ParsedSudoku {
  iterations: number;
  sudoku: string;
}

const parsedSudokus: {
  [key: string]: ParsedSudoku[];
} = sudokus;

function addIds<T>(array: T[]): Array<{id: number; value: T}> {
  return array.map((d, id) => {
    return {
      value: d,
      id,
    };
  });
}

export default {
  [DIFFICULTY.EASY]: addIds(parsedSudokus.easy.map(d => d.sudoku)),
  [DIFFICULTY.MEDIUM]: addIds(parsedSudokus.medium.map(d => d.sudoku)),
  [DIFFICULTY.HARD]: addIds(parsedSudokus.hard.map(d => d.sudoku)),
  [DIFFICULTY.EVIL]: addIds(parsedSudokus.evil.map(d => d.sudoku)),
};
