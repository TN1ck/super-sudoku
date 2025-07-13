import generateSudoku, {isSudokuUnique} from "./generate";
import {createSeededRandom} from "./seededRandom";
import {solve} from "./solverAC3";
import {EMPTY_SUDOKU, SOLVED_SUDOKUS} from "./testutils";
import {DIFFICULTY} from "./types";
import {stringifySudoku} from "./utility";
import {describe, it, expect} from "vitest";

describe("generate", () => {
  it("generates the same sudoku using a seed", () => {
    const randomFn = createSeededRandom(10);
    const sudoku = generateSudoku(DIFFICULTY.EASY, randomFn);
    const stringified = stringifySudoku(sudoku.sudoku);
    expect(stringified).toBe("080902506061078040040050003050104020400000900013090085000020000725800000800705030");
    // Check if it is unique.
    expect(isSudokuUnique(sudoku.sudoku)).toBe(true);
    // Check if it can be solved.
    expect(solve(sudoku.sudoku).iterations).toBe(4);
  });

  it("generates the difficult sudoku using a seed", () => {
    const randomFn = createSeededRandom(10);
    const sudoku = generateSudoku(DIFFICULTY.EVIL, randomFn);
    // Check if it is unique.
    expect(isSudokuUnique(sudoku.sudoku)).toBe(true);
    // Check if it can be solved.
    // The difficulty is capped, as we don't do to many changes.
    expect(solve(sudoku.sudoku).iterations).toBe(32);
  });

  it("generates the difficult sudoku using a seed", () => {
    const randomFn = createSeededRandom(4);
    const sudoku = generateSudoku(DIFFICULTY.EVIL, randomFn);
    // Check if it is unique.
    expect(isSudokuUnique(sudoku.sudoku)).toBe(true);
    // Check if it can be solved.
    // The difficulty is capped, as we don't do to many changes.
    expect(solve(sudoku.sudoku).iterations).toBe(248);
  });
});

describe("checkForUniqueness", () => {
  it("empty sudoku is not unique", () => {
    expect(isSudokuUnique(EMPTY_SUDOKU)).toBe(false);
  });

  it("test sudokus are unique", () => {
    SOLVED_SUDOKUS.forEach((s) => {
      expect(isSudokuUnique(s.unsolved)).toBe(true);
    });
  });
});
