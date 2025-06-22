import {SimpleSudoku} from "src/engine/types";
import sudokus from "../../sudokus.json";

import easySudokus from "../../sudokus/easy.txt?raw";
import mediumSudokus from "../../sudokus/medium.txt?raw";
import hardSudokus from "../../sudokus/hard.txt?raw";
import expertSudokus from "../../sudokus/expert.txt?raw";
import evilSudokus from "../../sudokus/evil.txt?raw";
import {parseSudoku, stringifySudoku} from "src/engine/utility";
import {solve} from "src/engine/solverAC3";

function parseSudokus(sudokus: string) {
  const parsedSudokus = sudokus.split("\n").map((line) => {
    const sudoku = parseSudoku(line);
    const solved = solve(sudoku);
    return {sudoku, solution: solved.sudoku, iterations: solved.iterations};
  });
  return parsedSudokus.filter((s) => s.solution !== null) as SudokuRaw[];
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
