import generateSudoku, {DIFFICULTY_RANGES, increaseDifficultyOfSudoku, isSudokuUnique} from "./generate_bitmask";
import {
  generateSudoku as generateSudokuHuman,
  increaseDifficultyOfSudoku as increaseDifficultyOfSudokuHuman,
  isSudokuUnique as isSudokuUniqueHuman,
} from "./generate_human";
import {createSeededRandom} from "./seededRandom";
import {solve} from "./solverAC3_bitmask";
import {
  EMPTY_SUDOKU,
  ISSUE_33_CUSTOM_SUDOKU,
  SOLVED_SUDOKUS,
  TWO_SOLUTION_SUDOKU,
  UNSOLVABLE_VALID_GIVENS_SUDOKU,
  isValidCompletedSudoku,
  preservesGivens,
} from "./testutils";
import {DIFFICULTY} from "./types";
import {cloneSudoku, parseSudoku, stringifySudoku} from "./utility";
import {describe, it, expect} from "vite-plus/test";

const INVALID_GIVENS_SUDOKU = parseSudoku(
  "110000000000000000000000000000000000000000000000000000000000000000000000000000000",
);

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

  it("keeps simplifying an easy puzzle when an added clue leaves its rating unchanged", () => {
    const result = generateSudoku(DIFFICULTY.EASY, createSeededRandom(0));
    const [min, max] = DIFFICULTY_RANGES[DIFFICULTY.EASY];
    const {iterations} = solve(result.sudoku);

    expect(iterations).toBeGreaterThanOrEqual(min);
    expect(iterations).toBeLessThanOrEqual(max);
    expect(result).toMatchObject({iterations, isInDifficultyRange: true, reachedMaxIterations: false});
    expect(isSudokuUnique(result.sudoku)).toBe(true);
  });

  it("generates the difficult sudoku using a seed", () => {
    const randomFn = createSeededRandom(10);
    const sudoku = generateSudoku(DIFFICULTY.EVIL, randomFn);
    // Check if it is unique.
    expect(isSudokuUnique(sudoku.sudoku)).toBe(true);
    // Check if it can be solved.
    // The difficulty is capped, as we don't do to many changes.
    expect(solve(sudoku.sudoku).iterations).toBe(32);
    expect(sudoku.reachedMaxIterations).toBe(true);
  });

  it.each([
    [DIFFICULTY.EASY, 1],
    [DIFFICULTY.MEDIUM, 1],
    [DIFFICULTY.HARD, 1],
    [DIFFICULTY.EXPERT, 1],
    [DIFFICULTY.EVIL, 1],
    [DIFFICULTY.MEDIUM, 2],
    [DIFFICULTY.HARD, 0],
  ])("generates valid, unique, deterministic %s puzzles for seed %i", (difficulty, seed) => {
    const first = generateSudoku(difficulty, createSeededRandom(seed));
    const second = generateSudoku(difficulty, createSeededRandom(seed));

    expect(stringifySudoku(first.sudoku)).toBe(stringifySudoku(second.sudoku));
    expect(first.iterations).toBe(second.iterations);
    expect(first.isInDifficultyRange).toBe(second.isInDifficultyRange);
    expect(first.reachedMaxIterations).toBe(second.reachedMaxIterations);

    expect(isSudokuUnique(first.sudoku)).toBe(true);

    const solved = solve(first.sudoku);
    expect(solved.sudoku).not.toBeNull();
    expect(solved.iterations).toBe(first.iterations);
    expect(isValidCompletedSudoku(solved.sudoku!)).toBe(true);
    expect(preservesGivens(first.sudoku, solved.sudoku!)).toBe(true);

    const [min, max] = DIFFICULTY_RANGES[difficulty];
    expect(first.isInDifficultyRange).toBe(first.iterations >= min && first.iterations <= max);
  });

  it("handles the slow tail-latency seed 4 deterministically", {timeout: 30_000}, () => {
    const result = generateSudoku(DIFFICULTY.EASY, createSeededRandom(4));
    expect(isSudokuUnique(result.sudoku)).toBe(true);
    expect(result.isInDifficultyRange).toBe(true);
    expect(solve(result.sudoku).iterations).toBe(result.iterations);
  });
});

describe("increaseDifficultyOfSudoku", () => {
  it("removes a clue to increase difficulty without mutating input", () => {
    const original = cloneSudoku(SOLVED_SUDOKUS[0].unsolved);
    const originalSnapshot = stringifySudoku(original);
    const originalIterations = solve(original).iterations;

    const harder = increaseDifficultyOfSudoku(original, createSeededRandom(7));

    expect(stringifySudoku(original)).toBe(originalSnapshot);
    expect(isSudokuUnique(harder)).toBe(true);
    expect(solve(harder).iterations).toBeGreaterThan(originalIterations);
  });
});

describe("checkForUniqueness", () => {
  it("empty sudoku is not unique", () => {
    expect(isSudokuUnique(EMPTY_SUDOKU)).toBe(false);
  });

  it("invalid givens are not unique", () => {
    expect(isSudokuUnique(INVALID_GIVENS_SUDOKU)).toBe(false);
  });

  it("unsolvable valid-givens sudoku is not unique", () => {
    expect(isSudokuUnique(UNSOLVABLE_VALID_GIVENS_SUDOKU)).toBe(false);
  });

  it("two-solution deadly-rectangle sudoku is not unique", () => {
    expect(isSudokuUnique(TWO_SOLUTION_SUDOKU)).toBe(false);
  });

  it("already-solved sudoku is unique", () => {
    expect(isSudokuUnique(SOLVED_SUDOKUS[0].solved)).toBe(true);
  });

  it("test sudokus are unique", () => {
    SOLVED_SUDOKUS.forEach((s) => {
      expect(isSudokuUnique(s.unsolved)).toBe(true);
    });
  });

  it("recognizes the custom sudoku from issue #33 as unique", {timeout: 30_000}, () => {
    expect(isSudokuUnique(ISSUE_33_CUSTOM_SUDOKU.unsolved)).toBe(true);
  });
});

describe("bitmask vs human equivalence", () => {
  it.each([
    [DIFFICULTY.EASY, 10],
    [DIFFICULTY.MEDIUM, 1],
    [DIFFICULTY.HARD, 0],
    [DIFFICULTY.EVIL, 10],
  ])("generate_bitmask matches generate_human for %s (seed %i)", (difficulty, seed) => {
    const bitmask = generateSudoku(difficulty, createSeededRandom(seed));
    const human = generateSudokuHuman(difficulty, createSeededRandom(seed));

    expect(stringifySudoku(bitmask.sudoku)).toBe(stringifySudoku(human.sudoku));
    expect(bitmask.iterations).toBe(human.iterations);
    expect(bitmask.isInDifficultyRange).toBe(human.isInDifficultyRange);
    expect(bitmask.reachedMaxIterations).toBe(human.reachedMaxIterations);
  });

  it("increaseDifficultyOfSudoku and isSudokuUnique match _human", () => {
    const bitmaskHarder = increaseDifficultyOfSudoku(SOLVED_SUDOKUS[0].unsolved, createSeededRandom(7));
    const humanHarder = increaseDifficultyOfSudokuHuman(SOLVED_SUDOKUS[0].unsolved, createSeededRandom(7));
    expect(stringifySudoku(bitmaskHarder)).toBe(stringifySudoku(humanHarder));

    for (const grid of [
      EMPTY_SUDOKU,
      INVALID_GIVENS_SUDOKU,
      UNSOLVABLE_VALID_GIVENS_SUDOKU,
      TWO_SOLUTION_SUDOKU,
      SOLVED_SUDOKUS[0].unsolved,
      SOLVED_SUDOKUS[0].solved,
    ]) {
      expect(isSudokuUnique(grid)).toBe(isSudokuUniqueHuman(grid));
    }
  });
});
