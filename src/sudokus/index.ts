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

function sortSudokus(parsed: ParsedSudoku[]): ParsedSudoku[] {
  return parsed.sort((a, b) => a.iterations - b.iterations);
}

export default {
  [DIFFICULTY.EASY]: addIds(sortSudokus(parsedSudokus.easy).map(d => d.sudoku)),
  [DIFFICULTY.MEDIUM]: addIds(sortSudokus(parsedSudokus.medium).map(d => d.sudoku)),
  [DIFFICULTY.HARD]: addIds(sortSudokus(parsedSudokus.hard).map(d => d.sudoku)),
  [DIFFICULTY.EVIL]: addIds(sortSudokus(parsedSudokus.evil).map(d => d.sudoku)),
};
