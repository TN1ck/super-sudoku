import {describe, it} from "vite-plus/test";
import {
  generateSudoku as generateBitmask,
  increaseDifficultyOfSudoku as increaseDifficultyBitmask,
  isSudokuUnique as isUniqueBitmask,
} from "./generate_bitmask";
import {
  generateSudoku as generateHuman,
  increaseDifficultyOfSudoku as increaseDifficultyHuman,
  isSudokuUnique as isUniqueHuman,
} from "./generate_human";
import {createSeededRandom} from "./seededRandom";
import {solve as solveAC3Bitmask} from "./solverAC3_bitmask";
import {solve as solveAC3Human} from "./solverAC3_human";
import {
  countSolutions as countSolutionsBitmask,
  solveBacktracking as solveBacktrackingBitmask,
} from "./solverBacktracking_bitmask";
import {
  countSolutions as countSolutionsHuman,
  solveBacktracking as solveBacktrackingHuman,
} from "./solverBacktracking_human";
import {ISSUE_33_CUSTOM_SUDOKU, SOLVED_SUDOKUS, TWO_SOLUTION_SUDOKU, UNSOLVABLE_VALID_GIVENS_SUDOKU} from "./testutils";
import {DIFFICULTY} from "./types";

const BENCH_SEEDS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

// Local bindings avoid Vitest module-runner getter overhead inside hot benchmark loops.
const runGenerateBitmask = generateBitmask;
const runGenerateHuman = generateHuman;
const runIncreaseDifficultyBitmask = increaseDifficultyBitmask;
const runIncreaseDifficultyHuman = increaseDifficultyHuman;
const runIsUniqueBitmask = isUniqueBitmask;
const runIsUniqueHuman = isUniqueHuman;
const runSeededRandom = createSeededRandom;
const runSolveAC3Bitmask = solveAC3Bitmask;
const runSolveAC3Human = solveAC3Human;
const runCountSolutionsBitmask = countSolutionsBitmask;
const runCountSolutionsHuman = countSolutionsHuman;
const runSolveBacktrackingBitmask = solveBacktrackingBitmask;
const runSolveBacktrackingHuman = solveBacktrackingHuman;

const EASY_GRID = SOLVED_SUDOKUS[0].unsolved;
const MEDIUM_GRID = SOLVED_SUDOKUS[2].unsolved;
const EVIL_GRID = SOLVED_SUDOKUS[3].unsolved;
const ISSUE_33_GRID = ISSUE_33_CUSTOM_SUDOKU.unsolved;
const TWO_SOL_GRID = TWO_SOLUTION_SUDOKU;
const UNSOLVABLE_GRID = UNSOLVABLE_VALID_GIVENS_SUDOKU;

describe("sudoku generation benchmarks (bitmask vs human)", () => {
  it("compares single-puzzle generation by difficulty", {timeout: 60_000}, async ({bench}) => {
    await bench.compare(
      bench("generate_bitmask EASY (seed 10)", () => {
        runGenerateBitmask(DIFFICULTY.EASY, runSeededRandom(10));
      }),
      bench("generate_human EASY (seed 10)", () => {
        runGenerateHuman(DIFFICULTY.EASY, runSeededRandom(10));
      }),
      bench("generate_bitmask HARD (seed 0)", () => {
        runGenerateBitmask(DIFFICULTY.HARD, runSeededRandom(0));
      }),
      bench("generate_human HARD (seed 0)", () => {
        runGenerateHuman(DIFFICULTY.HARD, runSeededRandom(0));
      }),
      bench("generate_bitmask EVIL (seed 10)", () => {
        runGenerateBitmask(DIFFICULTY.EVIL, runSeededRandom(10));
      }),
      bench("generate_human EVIL (seed 10)", () => {
        runGenerateHuman(DIFFICULTY.EVIL, runSeededRandom(10));
      }),
      {time: 300, warmupIterations: 1, iterations: 3},
    );
  });

  it("generates a 10-seed batch with generate_bitmask", {timeout: 60_000}, async ({bench}) => {
    await bench.compare(
      bench("batch 10x EASY (bitmask)", () => {
        for (const seed of BENCH_SEEDS) {
          runGenerateBitmask(DIFFICULTY.EASY, runSeededRandom(seed));
        }
      }),
      bench("batch 10x HARD (bitmask)", () => {
        for (const seed of BENCH_SEEDS) {
          runGenerateBitmask(DIFFICULTY.HARD, runSeededRandom(seed));
        }
      }),
      bench("batch 10x EVIL (bitmask)", () => {
        for (const seed of BENCH_SEEDS) {
          runGenerateBitmask(DIFFICULTY.EVIL, runSeededRandom(seed));
        }
      }),
      {time: 300, warmupIterations: 1, iterations: 3},
    );
  });

  it("handles tail-latency seed 4 (EASY) with generate_bitmask", {timeout: 30_000}, async ({bench}) => {
    await bench("generate_bitmask EASY (tail-latency seed 4)", () => {
      runGenerateBitmask(DIFFICULTY.EASY, runSeededRandom(4));
    }).run({time: 200, warmupIterations: 1, iterations: 3});
  });

  it("compares increaseDifficultyOfSudoku (bitmask vs human)", {timeout: 30_000}, async ({bench}) => {
    await bench.compare(
      bench("increaseDifficulty_bitmask (easy -> harder)", () => {
        runIncreaseDifficultyBitmask(EASY_GRID, runSeededRandom(7));
      }),
      bench("increaseDifficulty_human (easy -> harder)", () => {
        runIncreaseDifficultyHuman(EASY_GRID, runSeededRandom(7));
      }),
      {time: 300, warmupIterations: 1, iterations: 3},
    );
  });
});

describe("solver benchmarks (bitmask vs human)", () => {
  it("compares AC3 solver (bitmask vs human)", {timeout: 60_000}, async ({bench}) => {
    await bench.compare(
      bench("solveAC3_bitmask easy (5 iters)", () => {
        runSolveAC3Bitmask(EASY_GRID);
      }),
      bench("solveAC3_human easy (5 iters)", () => {
        runSolveAC3Human(EASY_GRID);
      }),
      bench("solveAC3_bitmask medium (40 iters)", () => {
        runSolveAC3Bitmask(MEDIUM_GRID);
      }),
      bench("solveAC3_human medium (40 iters)", () => {
        runSolveAC3Human(MEDIUM_GRID);
      }),
      bench("solveAC3_bitmask evil (726 iters)", () => {
        runSolveAC3Bitmask(EVIL_GRID);
      }),
      bench("solveAC3_human evil (726 iters)", () => {
        runSolveAC3Human(EVIL_GRID);
      }),
      bench("solveAC3_bitmask issue #33 (fallback)", () => {
        runSolveAC3Bitmask(ISSUE_33_GRID);
      }),
      bench("solveAC3_human issue #33 (fallback)", () => {
        runSolveAC3Human(ISSUE_33_GRID);
      }),
      bench("solveAC3_bitmask unsolvable valid givens", () => {
        runSolveAC3Bitmask(UNSOLVABLE_GRID);
      }),
      bench("solveAC3_human unsolvable valid givens", () => {
        runSolveAC3Human(UNSOLVABLE_GRID);
      }),
      {time: 250, warmupIterations: 1, iterations: 2},
    );
  });

  it("compares uniqueness and backtracking solver (bitmask vs human)", {timeout: 60_000}, async ({bench}) => {
    await bench.compare(
      bench("isSudokuUnique_bitmask easy", () => {
        runIsUniqueBitmask(EASY_GRID);
      }),
      bench("isSudokuUnique_human easy", () => {
        runIsUniqueHuman(EASY_GRID);
      }),
      bench("isSudokuUnique_bitmask evil", () => {
        runIsUniqueBitmask(EVIL_GRID);
      }),
      bench("isSudokuUnique_human evil", () => {
        runIsUniqueHuman(EVIL_GRID);
      }),
      bench("isSudokuUnique_bitmask 2-solution", () => {
        runIsUniqueBitmask(TWO_SOL_GRID);
      }),
      bench("isSudokuUnique_human 2-solution", () => {
        runIsUniqueHuman(TWO_SOL_GRID);
      }),
      bench("solveBacktracking_bitmask issue #33", () => {
        runSolveBacktrackingBitmask(ISSUE_33_GRID);
      }),
      bench("solveBacktracking_human issue #33", () => {
        runSolveBacktrackingHuman(ISSUE_33_GRID);
      }),
      bench("countSolutions_bitmask(2) issue #33", () => {
        runCountSolutionsBitmask(ISSUE_33_GRID, 2);
      }),
      bench("countSolutions_human(2) issue #33", () => {
        runCountSolutionsHuman(ISSUE_33_GRID, 2);
      }),
      {time: 250, warmupIterations: 1, iterations: 2},
    );
  });
});
