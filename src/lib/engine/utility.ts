import groupBy from "lodash-es/groupBy";
import sortBy from "lodash-es/sortBy";
import {SimpleSudoku, Cell} from "./types";
export const SUDOKU_COORDINATES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const SUDOKU_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// SQUARE TABLE
/*
    _x = 0       _x = 1     _x = 2
.-----0-----------1----------2------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 0
|   y < 3   | y < 3     |   y < 3   |h
|-----3-----------4----------5------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 1
| 3 < y < 6 | 3 < y < 6 | 3 < y < 6 |
.-----6-----------7----------8------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 2
|   y > 6   | y > 6     |   y > 6   |
|-----------------------------------|
square = _y * 3 + _x;
*/
export const SQUARE_TABLE = (function () {
  const cells: Array<[number, number]> = ([] as Array<[number, number]>).concat(
    ...SUDOKU_COORDINATES.map((x) => {
      return SUDOKU_COORDINATES.map((y) => {
        return [x, y] as [number, number];
      });
    }),
  );
  const grouped = groupBy(cells, ([x, y]) => {
    return Math.floor(y / 3) * 3 + Math.floor(x / 3);
  });
  // we sort them, so we can use an optimization
  const squares = sortBy(Object.keys(grouped), (k) => k).map((k) =>
    sortBy(grouped[Number(k)], ([x, y]) => `${y}-${x}`),
  );
  return squares;
})();

export function squareIndex(x: number, y: number): number {
  return Math.floor(y / 3) * 3 + Math.floor(x / 3);
}

export function simpleSudokuToCells(grid: SimpleSudoku, solution?: SimpleSudoku): Cell[] {
  return ([] as Cell[]).concat(
    ...grid.map((row, y) => {
      return row.map((n, x) => {
        return {
          x,
          y,
          number: n,
          notes: [],
          initial: n !== 0,
          solution: solution ? solution[y][x] : 0,
        };
      });
    }),
  );
}

export function cellsToSimpleSudoku(cells: Cell[]): SimpleSudoku {
  const simple: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  cells.forEach((cell) => {
    if (cell.initial) {
      simple[cell.y][cell.x] = cell.number;
    }
  });
  return simple;
}

export function stringifySudoku(grid: SimpleSudoku) {
  return grid
    .map((row) => {
      return row.map((c) => (c === 0 ? "0" : c.toString())).join("");
    })
    .join("");
}

export function parseSudoku(sudoku: string): SimpleSudoku {
  // Handle multi-line format with underscores (for tests)
  if (sudoku.includes("\n")) {
    const lines = sudoku.split("\n").filter((line) => line.trim() !== "");
    if (lines.length !== 9) {
      throw new Error(`Wrong number of lines! Only 9 allowed: ${sudoku}`);
    }
    return lines.map((line) => {
      const characters = line.split("");
      if (characters.length !== 9) {
        throw new Error(`Wrong number of characters in line! Only 9 allowed: ${line} - ${sudoku}`);
      }
      return characters.map((c) => {
        if (c === "_" || c === "0") {
          return 0;
        }
        const number = Number(c);
        if (isNaN(number) || number < 1 || number > 9) {
          throw new Error(`The input data is incorrect, only 1-9 and _/0 allowed, but found ${c}`);
        }
        return number;
      });
    });
  }

  // Handle single string format (for production)
  if (sudoku.length !== 9 * 9) {
    throw new Error(
      `The input data is incorrect, only 81 characters allowed, but found ${sudoku.length} characters. Input: ${sudoku}`,
    );
  }

  for (const char of sudoku) {
    if (["0"].concat(SUDOKU_NUMBERS.map((n) => String(n))).indexOf(char) < 0) {
      throw new Error(`The input data is incorrect, only 0-9 allowed, but found ${char}`);
    }
  }

  const lines = [];
  for (let i = 0; i < 9; i++) {
    lines.push(sudoku.slice(i * 9, (i + 1) * 9));
  }

  if (lines.length !== 9) {
    throw new Error(`Wrong number of lines! Only 9 allowed: ${sudoku}`);
  }

  return lines.map((line) => {
    const characters = line.split("");
    if (characters.length !== 9) {
      throw new Error(`Wrong number of characters in line! Only 9 allowed: ${line} - ${sudoku}`);
    }
    return characters.map((c) => {
      const number = c === "0" ? 0 : Number(c);
      return number;
    });
  });
}
