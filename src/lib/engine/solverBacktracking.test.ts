import {expect, describe, it} from "vite-plus/test";

import {countSolutions, solveBacktracking} from "./solverBacktracking_bitmask";
import {
  countSolutions as countSolutionsHuman,
  solveBacktracking as solveBacktrackingHuman,
} from "./solverBacktracking_human";
import {
  EMPTY_SUDOKU,
  ISSUE_33_CUSTOM_SUDOKU,
  SOLVED_SUDOKUS,
  TWO_SOLUTION_SUDOKU,
  UNSOLVABLE_VALID_GIVENS_SUDOKU,
} from "./testutils";
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

  it("returns no solutions for an unsolvable grid with valid givens", () => {
    const countResult = countSolutions(UNSOLVABLE_VALID_GIVENS_SUDOKU, 2);
    expect(countResult.count).toBe(0);
    expect(countResult.firstSolution).toBeNull();

    const solveResult = solveBacktracking(UNSOLVABLE_VALID_GIVENS_SUDOKU);
    expect(solveResult.sudoku).toBeNull();
    expect(solveResult.iterations).toBe(Infinity);
  });

  it("counts exactly two solutions for a deadly-rectangle grid and respects limits", () => {
    expect(countSolutions(TWO_SOLUTION_SUDOKU, 1).count).toBe(1);
    expect(countSolutions(TWO_SOLUTION_SUDOKU, 2).count).toBe(2);
    expect(countSolutions(TWO_SOLUTION_SUDOKU, 3).count).toBe(2);
  });

  it("counts one solution for an already-solved grid", () => {
    const result = countSolutions(SOLVED_SUDOKUS[0].solved, 2);
    expect(result.count).toBe(1);
    expect(stringifySudoku(result.firstSolution!)).toBe(stringifySudoku(SOLVED_SUDOKUS[0].solved));
  });
});

describe("bitmask vs human equivalence", () => {
  it("matches solverBacktracking_human on unique, multi-solution, invalid, and unsolvable grids", () => {
    const cases = [
      ...SOLVED_SUDOKUS.map((s) => s.unsolved),
      SOLVED_SUDOKUS[0].solved,
      TWO_SOLUTION_SUDOKU,
      ROW_CONFLICT_SUDOKU,
      COLUMN_CONFLICT_SUDOKU,
      SQUARE_CONFLICT_SUDOKU,
      UNSOLVABLE_VALID_GIVENS_SUDOKU,
    ];

    for (const grid of cases) {
      const bitmaskCount = countSolutions(grid, 2);
      const humanCount = countSolutionsHuman(grid, 2);
      expect(bitmaskCount.count).toBe(humanCount.count);
      if (humanCount.count === 1) {
        expect(stringifySudoku(bitmaskCount.firstSolution!)).toBe(stringifySudoku(humanCount.firstSolution!));
      } else if (humanCount.count === 0) {
        expect(bitmaskCount.firstSolution).toBeNull();
      }

      const bitmaskSolve = solveBacktracking(grid);
      const humanSolve = solveBacktrackingHuman(grid);
      expect(bitmaskSolve.sudoku !== null).toBe(humanSolve.sudoku !== null);
      if (humanCount.count === 1) {
        expect(stringifySudoku(bitmaskSolve.sudoku!)).toBe(stringifySudoku(humanSolve.sudoku!));
      }
    }
  });
});
