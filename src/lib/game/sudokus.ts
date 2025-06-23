import {SimpleSudoku} from "src/lib/engine/types";

import easySudokus from "../../../sudokus/easy.txt?raw";
import mediumSudokus from "../../../sudokus/medium.txt?raw";
import hardSudokus from "../../../sudokus/hard.txt?raw";
import expertSudokus from "../../../sudokus/expert.txt?raw";
import evilSudokus from "../../../sudokus/evil.txt?raw";
import {parseSudoku} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3";

function parseSudokus(sudokus: string) {
  const parsedSudokus = sudokus.split("\n").map((line) => {
    const sudoku = parseSudoku(line);
    const solved = solve(sudoku);
    return {sudoku, solution: solved.sudoku, iterations: solved.iterations};
  });

  const validSudokus: SudokuRaw[] = [];
  for (const sudoku of parsedSudokus) {
    if (sudoku.solution !== null) {
      validSudokus.push({
        iterations: sudoku.iterations,
        sudoku: sudoku.sudoku,
        solution: sudoku.solution,
      });
    } else {
      console.warn("Invalid sudoku: ", sudoku.sudoku);
    }
  }
  return validSudokus;
}

export interface SudokuRaw {
  iterations: number;
  sudoku: SimpleSudoku;
  solution: SimpleSudoku;
}

const SUDOKUS: {
  easy: SudokuRaw[];
  medium: SudokuRaw[];
  hard: SudokuRaw[];
  expert: SudokuRaw[];
  evil: SudokuRaw[];
} = {
  easy: parseSudokus(easySudokus),
  medium: parseSudokus(mediumSudokus),
  hard: parseSudokus(hardSudokus),
  expert: parseSudokus(expertSudokus),
  evil: parseSudokus(evilSudokus),
};

export default SUDOKUS;
