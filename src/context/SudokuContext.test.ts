import {describe, expect, it} from "vitest";
import {createSudokuState, sudokuReducer} from "./SudokuContext";
import SudokuGame from "src/lib/game/SudokuGame";
import {createSeededRandom, sample} from "src/lib/engine/seededRandom";
import {START_SUDOKU} from "src/lib/game/sudokus";
import {simpleSudokuToCells} from "src/lib/engine/utility";

const cells = simpleSudokuToCells(START_SUDOKU.solution, START_SUDOKU.solution);
const last = {...cells[80], number: 0, initial: false};
const state = createSudokuState([...cells.slice(0, 80), last]);

describe("board input boundaries", () => {
  it("requires a full board to win", () => {
    expect(SudokuGame.isSolved([])).toBe(false);
    expect(sudokuReducer(state, {type: "sudoku/SET_SUDOKU", sudoku: []})).toBe(state);
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


it("toggles visible pencil marks and restores them through undo and redo across 64 seeds", () => {
  const starting = simpleSudokuToCells(START_SUDOKU.sudoku, START_SUDOKU.solution);
  const editable = starting.filter(cell => !cell.initial);
  for (let seed = 1; seed <= 64; seed++) {
    const random = createSeededRandom(seed);
    let board = createSudokuState(starting);
    for (let step = 0; step < 50; step++) {
      const target = sample(editable, random);
      const index = target.y * 9 + target.x;
      const cell = board.current[index];
      const visible = SudokuGame.visibleNotes(cell, board.current, true);
      const digit = visible.length && random() < 0.7 ? sample(visible, random) : 1 + Math.floor(random() * 9);
      const previous = board.current;
      board = sudokuReducer(board, {
        type: "sudoku/SET_NOTES", cellCoordinates: cell, notes: SudokuGame.toggleNote(cell, visible, digit),
      });
      const after = SudokuGame.visibleNotes(board.current[index], board.current, true);
      expect(after.includes(digit), `seed ${seed}, step ${step}`).toBe(!visible.includes(digit));
      const undone = sudokuReducer(board, {type: "sudoku/UNDO"});
      expect(undone.current).toBe(previous);
      expect(sudokuReducer(undone, {type: "sudoku/REDO"}).current).toBe(board.current);
    }
  }
});
