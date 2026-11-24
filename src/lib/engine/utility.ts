import {Cell, CellCoordinates, SimpleSudoku} from "./types";

export const SUDOKU_COORDINATES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const SUDOKU_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// SQUARE TABLE
/*
    _x = 0       _x = 1     _x = 2
.-----0-----------1----------2------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 0
|   y < 3   | y < 3     |   y < 3   |
|-----3-----------4----------5------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 1
| 3 < y < 6 | 3 < y < 6 | 3 < y < 6 |
.-----6-----------7----------8------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 2
|   y > 6   | y > 6     |   y > 6   |
|-----------------------------------|
square = _y * 3 + _x;
*/
export const SQUARE_TABLE: Array<Array<[number, number]>> = (() => {
  const squares: Array<Array<[number, number]>> = Array.from({length: 9}, () => []);
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      squares[squareIndex(x, y)].push([x, y]);
    }
  }
  return squares;
})();

export function squareIndex(x: number, y: number): number {
  return Math.floor(y / 3) * 3 + Math.floor(x / 3);
}

export function sharesUnit(a: CellCoordinates, b: CellCoordinates) {
  return a.x === b.x || a.y === b.y || squareIndex(a.x, a.y) === squareIndex(b.x, b.y);
}

export function hasBoardShape(cells: Cell[]) {
  return (
    cells?.length === 81 &&
    cells.every((c) => SUDOKU_COORDINATES.includes(c.x) && SUDOKU_COORDINATES.includes(c.y)) &&
    new Set(cells.map((c) => c.y * 9 + c.x)).size === 81
  );
}

export function findCell(sudoku: Cell[], position?: CellCoordinates) {
  return position && sudoku.find((cell) => cell.x === position.x && cell.y === position.y);
}

export function createEmptySimpleSudoku(): SimpleSudoku {
  return Array.from({length: 9}, () => Array<number>(9).fill(0));
}

export function cloneSudoku(sudoku: SimpleSudoku): SimpleSudoku {
  return sudoku.map((row) => row.slice());
}

export function areCellsEqual(a: Cell[], b: Cell[]): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    const ca = a[i];
    const cb = b[i];
    if (ca === cb) {
      continue;
    }
    if (
      ca.x !== cb.x ||
      ca.y !== cb.y ||
      ca.number !== cb.number ||
      ca.initial !== cb.initial ||
      ca.solution !== cb.solution ||
      Boolean(ca.autoNotesHidden) !== Boolean(cb.autoNotesHidden) ||
      ca.notes.length !== cb.notes.length
    ) {
      return false;
    }
    for (let j = 0; j < ca.notes.length; j++) {
      if (ca.notes[j] !== cb.notes[j]) {
        return false;
      }
    }
  }
  return true;
}

export function simpleSudokuToCells(grid: SimpleSudoku, solution?: SimpleSudoku): Cell[] {
  return grid.flatMap((row, y) =>
    row.map((n, x) => ({
      x,
      y,
      number: n,
      notes: [],
      initial: n !== 0,
      solution: solution ? solution[y][x] : 0,
    })),
  );
}

export function cellsToSimpleSudoku(cells: Cell[]): SimpleSudoku {
  const simple = createEmptySimpleSudoku();
  for (const cell of cells) {
    if (cell.initial && cell.y >= 0 && cell.y < 9 && cell.x >= 0 && cell.x < 9) {
      simple[cell.y][cell.x] = cell.number;
    }
  }
  return simple;
}

export function stringifySudoku(grid: SimpleSudoku) {
  return grid.map((row) => row.join("")).join("");
}

export function parseSudoku(rawSudoku: string): SimpleSudoku {
  const sudoku = rawSudoku.trim();
  // Handle multi-line format with underscores (for tests)
  if (sudoku.includes("\n")) {
    const lines = sudoku
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    if (lines.length !== 9) {
      throw new Error(`Wrong number of lines! Only 9 allowed: ${sudoku}`);
    }
    return lines.map((line) => {
      if (line.length !== 9) {
        throw new Error(`Wrong number of characters in line! Only 9 allowed: ${line} - ${sudoku}`);
      }
      return Array.from(line, (c) => {
        if (c === "_" || c === "0") {
          return 0;
        }
        const number = Number(c);
        if (!Number.isInteger(number) || number < 1 || number > 9) {
          throw new Error(`The input data is incorrect, only 1-9 and _/0 allowed, but found ${c}`);
        }
        return number;
      });
    });
  }

  // Handle single string format (for production)
  if (sudoku.length !== 81) {
    throw new Error(
      `The input data is incorrect, only 81 characters allowed, but found ${sudoku.length} characters. Input: ${sudoku}`,
    );
  }

  if (!/^[0-9]{81}$/.test(sudoku)) {
    const invalid = Array.from(sudoku).find((char) => char < "0" || char > "9");
    throw new Error(`The input data is incorrect, only 0-9 allowed, but found ${invalid}`);
  }

  const grid: SimpleSudoku = [];
  for (let row = 0; row < 9; row++) {
    const start = row * 9;
    const rowValues: number[] = [];
    for (let col = 0; col < 9; col++) {
      rowValues.push(Number(sudoku[start + col]));
    }
    grid.push(rowValues);
  }
  return grid;
}
