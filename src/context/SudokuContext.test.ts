import {describe, expect, it} from "vitest";
import {createSudokuState, sudokuReducer} from "./SudokuContext";
import SudokuGame from "src/lib/game/SudokuGame";
import {START_SUDOKU} from "src/lib/game/sudokus";
import {simpleSudokuToCells} from "src/lib/engine/utility";

const cells = simpleSudokuToCells(START_SUDOKU.solution, START_SUDOKU.solution);
const last = {...cells[80], number: 0, initial: false};
const state = createSudokuState([...cells.slice(0, 80), last]);

describe("board input boundaries", () => {
  it("requires a full board to win", () => {
    expect(SudokuGame.isSolved([])).toBe(false);
  });
  it("rejects an out-of-range number in the last empty cell", () => {
    const next = sudokuReducer(state, {type: "sudoku/SET_NUMBER", cellCoordinates: last, number: 10});
    expect(next).toBe(state);
    expect(SudokuGame.isSolved([...cells.slice(0, 80), {...last, number: 10}])).toBe(false);
  });
  it("rejects out-of-range pencil marks before they reach the renderer", () => {
    expect(sudokuReducer(state, {type: "sudoku/SET_NOTES", cellCoordinates: last, notes: [1, 10]})).toBe(state);
  });
});
