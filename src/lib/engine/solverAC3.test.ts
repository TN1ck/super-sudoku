import {solve} from "./solverAC3_bitmask";
import {solve as solveHuman} from "./solverAC3_human";
import {cloneSudoku, parseSudoku, stringifySudoku} from "./utility";
import {
  EMPTY_SUDOKU,
  ISSUE_33_CUSTOM_SUDOKU,
  SOLVED_SUDOKUS,
  UNSOLVABLE_VALID_GIVENS_SUDOKU,
  isValidCompletedSudoku,
  preservesGivens,
} from "./testutils";
import {describe, it, expect} from "vite-plus/test";

const ROW_CONFLICT_SUDOKU = parseSudoku(
  "110000000000000000000000000000000000000000000000000000000000000000000000000000000",
);
const COLUMN_CONFLICT_SUDOKU = parseSudoku(
  [
    "1________",
    "1________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
  ].join("\n"),
);
const SQUARE_CONFLICT_SUDOKU = parseSudoku(
  [
    "1________",
    "_1_______",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
  ].join("\n"),
);

describe("solve", () => {
  SOLVED_SUDOKUS.forEach((s, i) => {
    it(`solves correctly sudoku ${i}`, () => {
      const input = cloneSudoku(s.unsolved);
      const snapshot = stringifySudoku(input);
      const result = solve(input);
      expect(stringifySudoku(input)).toBe(snapshot);
      expect(result.sudoku).not.toBeNull();
      expect(isValidCompletedSudoku(result.sudoku!)).toBe(true);
      expect(preservesGivens(s.unsolved, result.sudoku!)).toBe(true);
      expect(stringifySudoku(result.sudoku!)).toBe(stringifySudoku(s.solved));
    });
  });

  it(`finds a solution for an empty sudoku`, () => {
    const result = solve(EMPTY_SUDOKU);
    expect(stringifySudoku(result.sudoku!)).toBe(
      [
        "123456789",
        "456789123",
        "789123456",
        "231674895",
        "875912364",
        "694538217",
        "367291548",
        "542867931",
        "918345672",
      ].join(""),
    );
  });

  it("solves the advanced custom sudoku from issue #33", () => {
    const result = solve(ISSUE_33_CUSTOM_SUDOKU.unsolved);

    expect(result.iterations).not.toBe(Infinity);
    expect(result.sudoku).not.toBeNull();
    expect(stringifySudoku(result.sudoku!)).toBe(stringifySudoku(ISSUE_33_CUSTOM_SUDOKU.solved));
  });

  it("solves an already-completed sudoku in 1 iteration", () => {
    const result = solve(SOLVED_SUDOKUS[0].solved);
    expect(result.iterations).toBe(1);
    expect(stringifySudoku(result.sudoku!)).toBe(stringifySudoku(SOLVED_SUDOKUS[0].solved));
  });

  it.each([
    ["row conflict", ROW_CONFLICT_SUDOKU],
    ["column conflict", COLUMN_CONFLICT_SUDOKU],
    ["square conflict", SQUARE_CONFLICT_SUDOKU],
    ["unsolvable valid givens", UNSOLVABLE_VALID_GIVENS_SUDOKU],
  ])("returns unsolvable for %s", (_, grid) => {
    const result = solve(grid);
    expect(result.sudoku).toBeNull();
    expect(result.iterations).toBe(Infinity);
  });
});

describe("iterations match", () => {
  const solvedSudokusIterations = [5, 5, 40, 726];
  SOLVED_SUDOKUS.forEach((s, i) => {
    it(`iterations match for ${i}`, () => {
      const result = solve(s.unsolved);
      expect(result.iterations).toBe(solvedSudokusIterations[i]);
    });
  });
});

describe("bitmask vs human equivalence", () => {
  it("matches solverAC3_human on solved, empty, and unsolvable grids", () => {
    const cases = [
      ...SOLVED_SUDOKUS.map((s) => s.unsolved),
      EMPTY_SUDOKU,
      SOLVED_SUDOKUS[0].solved,
      ROW_CONFLICT_SUDOKU,
      COLUMN_CONFLICT_SUDOKU,
      SQUARE_CONFLICT_SUDOKU,
      UNSOLVABLE_VALID_GIVENS_SUDOKU,
    ];

    for (const grid of cases) {
      const bitmask = solve(grid);
      const human = solveHuman(grid);

      expect(bitmask.iterations).toBe(human.iterations);
      expect(bitmask.sudoku ? stringifySudoku(bitmask.sudoku) : null).toBe(
        human.sudoku ? stringifySudoku(human.sudoku) : null,
      );
    }
  });
});
