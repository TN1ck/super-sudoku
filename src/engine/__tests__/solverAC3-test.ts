import * as solverAC3 from "../solverAC3";
import {
  parseSudoku,
  printSimpleSudoku,
  solvableSudoku1,
  solvableSudoku3,
  solvedSudoku1,
  solvedSudoku3,
} from "../utility";

describe("solve", () => {
  const solveableSudoku = parseSudoku(solvableSudoku1);
  const result = solverAC3.solve(solveableSudoku);
  it("the number of iterations should not change", () => {
    expect(result.iterations).toBe(5);
    expect(printSimpleSudoku(result.sudoku)).toBe(solvedSudoku1);
  });

  it("solves the sudoku", () => {
    const solveableSudoku = parseSudoku(solvableSudoku3);
    const result = solverAC3.solve(solveableSudoku);
    expect(result.iterations).toBe(40);
    expect(printSimpleSudoku(result.sudoku)).toBe(solvedSudoku3);
  });
});
