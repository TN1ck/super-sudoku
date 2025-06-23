import {stringifySudoku} from "./utility";
import {SimpleSudoku} from "./types";

import * as solverAC3 from "./solverAC3";

function measureTime<T>(fn: () => T, times: number): T {
  let result: T | undefined = undefined;
  const t0 = performance.now();
  for (let i = times; i > 0; i--) {
    result = fn();
  }
  const t1 = performance.now();
  console.log("Call to function took " + (t1 - t0) / times + " milliseconds.");
  return result!;
}

export function benchmark(grid: SimpleSudoku): SimpleSudoku {
  console.log(stringifySudoku(grid));

  const TIMES = 1;
  const AC3Result = measureTime(() => {
    return solverAC3.solve(grid);
  }, TIMES);

  console.log(stringifySudoku(AC3Result.sudoku!));

  return AC3Result.sudoku!;
}
