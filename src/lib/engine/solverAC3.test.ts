import {solve} from "./solverAC3";
import {stringifySudoku} from "./utility";
import {EMPTY_SUDOKU, SOLVED_SUDOKUS} from "./testutils";
import {describe, it, expect} from "vitest";

describe("solve", () => {
  SOLVED_SUDOKUS.forEach((s, i) => {
    it(`solves correctly sudoku ${i}`, () => {
      const result = solve(s.unsolved);
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
