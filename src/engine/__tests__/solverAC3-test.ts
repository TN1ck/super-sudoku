import * as solverAC3 from "../solverAC3";
import {parseSudoku, solvableSudoku1} from "../utility";

describe("solve", () => {
  const solveableSudoku = parseSudoku(solvableSudoku1);
  const result = solverAC3.solve(solveableSudoku);
  it("the number of iterations should not change", () => {
    expect(result.iterations).toBe(32);
  });
});
