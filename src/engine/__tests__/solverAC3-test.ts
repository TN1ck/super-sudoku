import * as solverAC3 from "../solverAC3";
import {parseSudoku, solvableSudoku1, solvedSudoku1} from "../utility";

describe("solve", () => {
  const solveableSudoku = parseSudoku(solvableSudoku1);
  const result = solverAC3.solve(solveableSudoku);
  it("solves a solvable sudoku correctly", () => {
    expect(result.sudoku).toEqual(parseSudoku(solvedSudoku1));
  });

  it("the number of iterations should not change", () => {
    expect(result.iterations).toBe(32);
  });
});
