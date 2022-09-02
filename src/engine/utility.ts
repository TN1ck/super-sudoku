import * as _ from "lodash";
import {SimpleSudoku, ComplexSudoku, Cell} from "./types";
export const SUDOKU_COORDINATES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const SUDOKU_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const solvableSudoku1 = [
  "_1____674",
  "_897_____",
  "__2_638__",
  "_28___76_",
  "___1__43_",
  "__692__18",
  "_6_235___",
  "2__4_81_6",
  "57_______",
].join("\n");

export const solvedSudoku1 = [
  "315892674",
  "689741325",
  "742563891",
  "128354769",
  "957186432",
  "436927518",
  "861235947",
  "293478156",
  "574619283",
].join("\n");

export const solvableSudoku2 = [
  "34567892_",
  "68914_57_",
  "71__3_68_",
  "27__86_3_",
  "8_47___9_",
  "_6___58__",
  "__78__1__",
  "__8____5_",
  "_________",
].join("\n");

export const solvableSudoku3 = [
  "____3____",
  "__1_65___",
  "5__2___3_",
  "__869_2__",
  "__74_2__5",
  "13__7__6_",
  "______927",
  "_8_______",
  "_4_9_____",
].join("\n");

export const solvedSudoku3 = [
  "894731652",
  "321865794",
  "576249138",
  "458693271",
  "967412385",
  "132578469",
  "615384927",
  "789126543",
  "243957816",
].join("\n");

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
export const SQUARE_TABLE = (function () {
  const cells: Array<[number, number]> = [].concat(
    ...SUDOKU_COORDINATES.map((x) => {
      return SUDOKU_COORDINATES.map((y) => {
        return [x, y];
      });
    }),
  );
  const grouped = _.groupBy(cells, ([x, y]) => {
    return Math.floor(y / 3) * 3 + Math.floor(x / 3);
  });
  // we sort them, so we can use an optimization
  const squares = _.sortBy(_.keys(grouped), (k) => k).map((k) => _.sortBy(grouped[k], ([x, y]) => `${y}-${x}`));
  return squares;
})();

export function squareIndex(x, y) {
  return Math.floor(y / 3) * 3 + Math.floor(x / 3);
}

export function printSimpleSudoku(grid: SimpleSudoku) {
  return grid
    .map((row) => {
      return row.map((c) => (c === 0 ? "_" : "" + c)).join("");
    })
    .join("\n");
}

export function duplicates(array: number[]): number {
  const filtered = array.filter((c) => c !== 0);
  const grouped = _.groupBy(filtered, (c) => c);
  const picked = _.pickBy(grouped, (x) => x.length > 1);
  return _.values(picked).length;
}

export function simpleSudokuToComplexSudoku(grid: SimpleSudoku): ComplexSudoku {
  return [].concat(
    ...grid.map((row, y) => {
      return row.map((n, x) => {
        return {
          x,
          y,
          number: n,
        };
      });
    }),
  );
}

export function simpleSudokuToCells(grid: SimpleSudoku, solution?: SimpleSudoku): Cell[] {
  return [].concat(
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

export function complexSudokuToSimpleSudoku(sudoku: ComplexSudoku): number[][] {
  const simple = [[], [], [], [], [], [], [], [], []];
  sudoku.forEach((cell) => {
    simple[cell.y][cell.x] = cell.number;
  });
  return simple;
}

export function parseSudoku(sudoku: string): SimpleSudoku {
  // check if the input-data is correct
  const inputDataIsCorrectDomain = [...sudoku].every((char) => {
    return ["\n", "_"].concat(SUDOKU_NUMBERS.map((n) => String(n))).indexOf(char) >= 0;
  });

  if (!inputDataIsCorrectDomain) {
    throw new Error("The input data is incorrect, only _, \n and 1...9 allowed");
  }

  const lines = sudoku.split("\n");

  if (lines.length !== 9) {
    throw new Error("Wrong number of lines! Only 9 allowed");
  }

  return lines.map((line) => {
    const characters = line.split("");
    if (characters.length !== 9) {
      throw new Error("Wrong number of characters in line! Only 9 allowed");
    }
    return characters.map((c) => {
      const number = c === "_" ? 0 : Number(c);
      return number;
    });
  });
}

export function printComplexSudoku(grid: ComplexSudoku) {
  return _.chain(grid)
    .groupBy((c) => {
      return c.y;
    })
    .toPairs()
    .sortBy(([, k]) => k)
    .map(([, cells]: [string, ComplexSudoku]) => {
      return _.sortBy(cells, (c) => c.x)
        .map((c) => {
          return c.number === 0 ? "_" : String(c.number);
        })
        .join("");
    })
    .join("\n");
}
