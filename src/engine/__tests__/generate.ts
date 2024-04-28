import generateSudoku, {checkForUniqueness} from "../generate";
import {createSeededRandom} from "../seededRandom";
import {solve} from "../solverAC3";
import {EMPTY_SUDOKU, SOLVED_SUDOKUS} from "../testutils";
import {DIFFICULTY} from "../types";
import {printSimpleSudoku} from "../utility";

describe("generate", () => {
  it("generates the same sudoku using a seed", () => {
    const randomFn = createSeededRandom(10);
    const sudoku = generateSudoku(DIFFICULTY.EASY, randomFn);
    const stringified = printSimpleSudoku(sudoku);
    expect(stringified).toBe(
      `_8_9_25_6
_61_78_4_
_4__5___3
_5_1_4_2_
4_____9__
_13_9__85
____2____
7258_____
8__7_5_3_`,
    );
    // Check if it is unique.
    expect(checkForUniqueness(sudoku)).toBe(true);
    // Check if it can be solved.
    expect(solve(sudoku).iterations).toBe(4);
  });
});

describe("checkForUniqueness", () => {
  it("empty sudoku is not unique", () => {
    expect(checkForUniqueness(EMPTY_SUDOKU)).toBe(false);
  });

  it("test sudokus are unique", () => {
    SOLVED_SUDOKUS.forEach((s) => {
      expect(checkForUniqueness(s.unsolved)).toBe(true);
    });
  });
});
