import {
  SimpleSudoku,
  printSimpleSudoku,
  complexSudokuToSimpleSudoku,
  simpleSudokuToComplexSudoku,
} from './utility';

import * as solverAC3 from './solverAC3';
import * as solverOptimized from './solverOptimized';
import * as solverNaive from './solverNaive';

function measureTime<T>(fn: () => T, times: number): T {
  let result;
  const t0 = performance.now();
  for (let i = times; i > 0; i--) {
    result = fn();
  }
  const t1 = performance.now();
  console.log('Call to function took ' + (t1 - t0) / times + ' milliseconds.');
  return result;
}

export function solve(grid: SimpleSudoku): SimpleSudoku {
  console.log(printSimpleSudoku(grid));

  const TIMES = 1;
  const naiveResult = measureTime(() => {
    return solverNaive.solve(simpleSudokuToComplexSudoku(grid));
  }, TIMES);
  const AC3Result = measureTime(() => {
    return solverAC3.solve(grid);
  }, TIMES);
  const optimizedResult = measureTime(() => {
    return solverOptimized.solve(grid);
  }, TIMES);

  console.log(
    printSimpleSudoku(complexSudokuToSimpleSudoku(naiveResult.sudoku)),
  );
  console.log(printSimpleSudoku(AC3Result.sudoku));
  console.log(printSimpleSudoku(optimizedResult.sudoku));

  return optimizedResult.sudoku;
}
