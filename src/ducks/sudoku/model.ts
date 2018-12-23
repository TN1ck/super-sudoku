import {Cell} from "src/engine/utility";

export function createCell(x: number, y: number, number: number, notes: Set<number>, initial: boolean): Cell {
  return {
    solution: 0,
    x,
    y,
    number,
    notes,
    initial,
  };
}

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

export const emptySudoku = [
  "_________",
  "_________",
  "_________",
  "_________",
  "_________",
  "_________",
  "_________",
  "_________",
  "_________",
].join("\n");

export function parseSudoku(sudoku: string): Cell[] {
  const lines = sudoku.split("\n");
  return [].concat(
    ...lines.map((line, y) => {
      const characters = line.split("");
      return characters.map((c, x) => {
        const number = c === "_" ? 0 : Number(c);
        return createCell(x, y, number, new Set([]), number !== 0);
      });
    }),
  );
}
