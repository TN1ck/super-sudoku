import {solve} from "../solverOptimized";
import {printSimpleSudoku} from "../utility";
import {EMPTY_SUDOKU, SOLVED_SUDOKUS} from "../testutils";

describe("solve", () => {
  SOLVED_SUDOKUS.forEach((s, i) => {
    it(`solves correctly sudoku ${i}`, () => {
      const result = solve(s.unsolved);
      expect(printSimpleSudoku(result.sudoku)).toBe(printSimpleSudoku(s.solved));
    });
  });

  it(`finds a solution for an empty sudoku`, () => {
    const result = solve(EMPTY_SUDOKU);
    expect(printSimpleSudoku(result.sudoku)).toBe(
      [
        "123456789",
        "456789123",
        "789123456",
        "231674895",
        "875912364",
        "694538217",
        "317265948",
        "542897631",
        "968341572",
      ].join("\n"),
    );
  });
});
