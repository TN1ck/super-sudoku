import {SimpleSudoku} from "src/lib/engine/types";

import easySudokus from "../../../sudokus/easy.txt?raw";
import mediumSudokus from "../../../sudokus/medium.txt?raw";
import hardSudokus from "../../../sudokus/hard.txt?raw";
import expertSudokus from "../../../sudokus/expert.txt?raw";
import evilSudokus from "../../../sudokus/evil.txt?raw";
import {parseSudoku} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3";

export interface SudokuRaw {
  iterations: number;
  sudoku: SimpleSudoku;
  solution: SimpleSudoku;
}

export interface PaginatedSudokus {
  sudokus: SudokuRaw[];
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type Difficulty = "easy" | "medium" | "hard" | "expert" | "evil";

const SUDOKU_FILES = {
  easy: easySudokus,
  medium: mediumSudokus,
  hard: hardSudokus,
  expert: expertSudokus,
  evil: evilSudokus,
} as const;

// Cache for parsed sudokus to avoid re-parsing
const parsedCache: Record<Difficulty, SudokuRaw[]> = {} as Record<Difficulty, SudokuRaw[]>;

// Cache for raw line counts
const lineCountCache: Record<Difficulty, number> = {} as Record<Difficulty, number>;

function getLineCount(difficulty: Difficulty): number {
  if (!lineCountCache[difficulty]) {
    lineCountCache[difficulty] = SUDOKU_FILES[difficulty].split("\n").filter((line) => line.trim()).length;
  }
  return lineCountCache[difficulty];
}

function parseSudokus(sudokus: string): SudokuRaw[] {
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

export function getSudokusPaginated(difficulty: Difficulty, page: number = 0, pageSize: number = 12): PaginatedSudokus {
  const totalRows = getLineCount(difficulty);
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;

  const rawLines = SUDOKU_FILES[difficulty].split("\n");
  const sudokus: SudokuRaw[] = [];

  for (const line of rawLines.slice(startIndex, endIndex)) {
    const sudoku = parseSudoku(line);
    const solved = solve(sudoku);
    const result = {
      sudoku,
      solution: solved.sudoku,
      iterations: solved.iterations,
    };
    if (result.solution !== null) {
      sudokus.push(result as SudokuRaw);
    } else {
      console.warn("Invalid sudoku: ", sudoku);
    }
  }

  return {
    sudokus,
    totalRows,
    page,
    pageSize,
    totalPages,
  };
}

export const START_SUDOKU_INDEX = 0;
export const START_SUDOKU_DIFFICULTY = "easy";
export const START_SUDOKU = getSudokusPaginated(START_SUDOKU_DIFFICULTY, START_SUDOKU_INDEX, START_SUDOKU_INDEX + 1)
  .sudokus[0];
