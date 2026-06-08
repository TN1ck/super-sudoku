import {expect, describe, it} from "vitest";

import {countSolutions, solveBacktracking} from "./solverBacktracking";
import {EMPTY_SUDOKU, ISSUE_33_CUSTOM_SUDOKU, SOLVED_SUDOKUS} from "./testutils";
import {parseSudoku, stringifySudoku} from "./utility";

const ROW_CONFLICT_SUDOKU = parseSudoku(
  "110000000000000000000000000000000000000000000000000000000000000000000000000000000",
);
const COLUMN_CONFLICT_SUDOKU = parseSudoku(
  [
    "100000000",
    "100000000",
    "000000000",
    "000000000",
    "000000000",
    "000000000",
    "000000000",
    "000000000",
    "000000000",
  ].join(""),
);
const SQUARE_CONFLICT_SUDOKU = parseSudoku(
  [
    "100000000",
    "010000000",
    "000000000",
    "000000000",
    "000000000",
    "000000000",
    "000000000",
    "000000000",
    "000000000",
  ].join(""),
);

describe("solveBacktracking", () => {
  it.each(SOLVED_SUDOKUS)("solves $description", ({unsolved, solved}) => {
    const result = solveBacktracking(unsolved);

    expect(result.iterations).not.toBe(Infinity);
    expect(result.sudoku).not.toBeNull();
    expect(stringifySudoku(result.sudoku!)).toBe(stringifySudoku(solved));
  });

  it("solves the custom sudoku from issue #33", () => {
    const result = solveBacktracking(ISSUE_33_CUSTOM_SUDOKU.unsolved);

    expect(result.iterations).not.toBe(Infinity);
    expect(result.sudoku).not.toBeNull();
    expect(stringifySudoku(result.sudoku!)).toBe(stringifySudoku(ISSUE_33_CUSTOM_SUDOKU.solved));
  });

  it("does not mutate the input grid", () => {
    const sudoku = ISSUE_33_CUSTOM_SUDOKU.unsolved.map((row) => row.slice());
    const before = stringifySudoku(sudoku);

    solveBacktracking(sudoku);

    expect(stringifySudoku(sudoku)).toBe(before);
  });

  it.each([
    ["row", ROW_CONFLICT_SUDOKU],
    ["column", COLUMN_CONFLICT_SUDOKU],
    ["square", SQUARE_CONFLICT_SUDOKU],
  ])("rejects invalid givens with a %s conflict", (_, sudoku) => {
    const result = solveBacktracking(sudoku);

    expect(result.sudoku).toBeNull();
    expect(result.iterations).toBe(Infinity);
  });
});

describe("countSolutions", () => {
  it("counts one solution for known unique sudokus", () => {
    for (const {unsolved, solved} of SOLVED_SUDOKUS) {
      const result = countSolutions(unsolved, 2);

      expect(result.count).toBe(1);
      expect(result.firstSolution).not.toBeNull();
      expect(stringifySudoku(result.firstSolution!)).toBe(stringifySudoku(solved));
    }
  });

  it("counts one solution for the custom sudoku from issue #33", () => {
    const result = countSolutions(ISSUE_33_CUSTOM_SUDOKU.unsolved, 2);

    expect(result.count).toBe(1);
    expect(result.firstSolution).not.toBeNull();
    expect(stringifySudoku(result.firstSolution!)).toBe(stringifySudoku(ISSUE_33_CUSTOM_SUDOKU.solved));
  });

  it("stops counting when the solution limit is reached", () => {
    const result = countSolutions(EMPTY_SUDOKU, 2);

    expect(result.count).toBe(2);
    expect(result.firstSolution).not.toBeNull();
  });

  it("returns no solutions for invalid givens", () => {
    const result = countSolutions(ROW_CONFLICT_SUDOKU, 2);

    expect(result.count).toBe(0);
    expect(result.firstSolution).toBeNull();
    expect(result.iterations).toBe(Infinity);
  });
});
