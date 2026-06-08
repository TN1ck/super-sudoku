import {expect, describe, it} from "vitest";

import {solve} from "src/lib/engine/solverAC3";
import {ISSUE_33_CUSTOM_SUDOKU} from "src/lib/engine/testutils";
import {simpleSudokuToCells} from "src/lib/engine/utility";

describe("custom sudoku solution metadata", () => {
  it("does not mark the valid issue #33 solution as wrong", () => {
    const result = solve(ISSUE_33_CUSTOM_SUDOKU.unsolved);
    expect(result.sudoku).not.toBeNull();

    const cells = simpleSudokuToCells(ISSUE_33_CUSTOM_SUDOKU.unsolved, result.sudoku!);
    const completedCells = cells.map((cell) => ({
      ...cell,
      number: cell.initial ? cell.number : ISSUE_33_CUSTOM_SUDOKU.solved[cell.y][cell.x],
    }));

    const wrongCells = completedCells
      .filter((cell) => !cell.initial && cell.number !== cell.solution)
      .map((cell) => ({
        x: cell.x,
        y: cell.y,
        expected: cell.number,
        actualSolutionMetadata: cell.solution,
      }));

    expect(wrongCells).toEqual([]);
  });

  it("provides a non-zero correct hint value for every empty issue #33 cell", () => {
    const result = solve(ISSUE_33_CUSTOM_SUDOKU.unsolved);
    expect(result.sudoku).not.toBeNull();

    const cells = simpleSudokuToCells(ISSUE_33_CUSTOM_SUDOKU.unsolved, result.sudoku!);
    const badHintCells = cells
      .filter((cell) => !cell.initial)
      .filter((cell) => cell.solution !== ISSUE_33_CUSTOM_SUDOKU.solved[cell.y][cell.x])
      .map((cell) => ({
        x: cell.x,
        y: cell.y,
        expectedHint: ISSUE_33_CUSTOM_SUDOKU.solved[cell.y][cell.x],
        actualHint: cell.solution,
      }));

    expect(badHintCells).toEqual([]);
  });
});
