import {describe, expect, it} from "vitest";
import {createSudokuState, sudokuReducer} from "./SudokuContext";
import {createNewGameState, gameReducer, GameStateMachine, INITIAL_GAME_STATE} from "./GameContext";
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
  it("deduplicates and sorts notes canonically", () => {
    const next = sudokuReducer(state, {type: "sudoku/SET_NOTES", cellCoordinates: last, notes: [7, 2, 7, 1]});
    expect(next.current[80].notes).toEqual([1, 2, 7]);
  });
  it("hides auto-notes on filled cells so toggling a note starts clean", () => {
    const filled = {...cells[80], initial: false, number: 2, notes: []};
    const board = [...cells.slice(0, 80), filled];
    expect(SudokuGame.visibleNotes(filled, board, true)).toEqual([]);
    expect(SudokuGame.toggleNote(filled, SudokuGame.visibleNotes(filled, board, true), 7)).toEqual([7]);
  });
  it("handles non-square coordinates and out-of-range note positions safely", () => {
    expect(SudokuGame.getCellPosition(cells[1], 180, 90)).toMatchObject({x: 30, y: 5});
    expect(() => SudokuGame.getNotePosition(0)).not.toThrow();
    expect(() => SudokuGame.getNotePosition(99)).not.toThrow();
  });
});

describe("game state transitions", () => {
  it("does not leak user preference keys into new game states", () => {
    const created = createNewGameState({
      sudokuIndex: 2,
      sudokuCollectionName: "medium",
      timesSolved: 1,
      previousTimes: [42],
    });
    expect(created).not.toHaveProperty("showHints");
    expect(created).not.toHaveProperty("showConflicts");
    expect(created).not.toHaveProperty("showCircleMenu");
    expect(created).not.toHaveProperty("showOccurrences");
    expect(created).not.toHaveProperty("showWrongEntries");
  });

  it("clears menu, notes overlay, and clipboard on reset", () => {
    const dirty = {
      ...INITIAL_GAME_STATE,
      state: GameStateMachine.paused,
      showMenu: true,
      showNotes: true,
      clipboardNotes: [1, 2],
      secondsPlayed: 45,
      won: true,
    };
    expect(gameReducer(dirty, {type: "game/RESET_GAME"})).toMatchObject({
      secondsPlayed: 0,
      state: GameStateMachine.running,
      won: false,
      showMenu: false,
      showNotes: false,
      clipboardNotes: null,
    });
  });

  it("preserves state identity on no-op transitions", () => {
    const paused = {...INITIAL_GAME_STATE, state: GameStateMachine.paused, showMenu: false, notesMode: false};
    expect(gameReducer(paused, {type: "game/PAUSE_GAME"})).toBe(paused);
    expect(gameReducer(paused, {type: "game/HIDE_MENU"})).toBe(paused);
    expect(gameReducer(paused, {type: "game/DEACTIVATE_NOTES_MODE"})).toBe(paused);

    const running = {...paused, state: GameStateMachine.running, activeCellCoordinates: {x: 2, y: 3}, notesMode: true};
    expect(gameReducer(running, {type: "game/CONTINUE_GAME"})).toBe(running);
    expect(gameReducer(running, {type: "game/ACTIVATE_NOTES_MODE"})).toBe(running);
    expect(gameReducer(running, {type: "game/SELECT_CELL", cellCoordinates: {x: 2, y: 3}})).toBe(running);

    const won = {...paused, won: true};
    expect(gameReducer(won, {type: "game/CONTINUE_GAME"})).toBe(won);
    expect(gameReducer(won, {type: "game/WON_GAME"})).toBe(won);
  });
});

it("toggles visible pencil marks and restores them through undo and redo across 64 seeds", () => {
  const starting = simpleSudokuToCells(START_SUDOKU.sudoku, START_SUDOKU.solution);
  const editable = starting.filter((cell) => !cell.initial);
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
        type: "sudoku/SET_NOTES",
        cellCoordinates: cell,
        notes: SudokuGame.toggleNote(cell, visible, digit),
      });
      const after = SudokuGame.visibleNotes(board.current[index], board.current, true);
      expect(after.includes(digit), `seed ${seed}, step ${step}`).toBe(!visible.includes(digit));
      const undone = sudokuReducer(board, {type: "sudoku/UNDO"});
      expect(undone.current).toBe(previous);
      expect(sudokuReducer(undone, {type: "sudoku/REDO"}).current).toBe(board.current);
    }
  }
});
