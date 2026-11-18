import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {GameStateMachine, INITIAL_GAME_STATE} from "src/context/GameContext";
import {ISSUE_33_CUSTOM_SUDOKU} from "src/lib/engine/testutils";
import {simpleSudokuToCells, stringifySudoku} from "src/lib/engine/utility";
import {getCurrentSudokuFromStorage, localStoragePlayedSudokuRepository as repository} from "./playedSudokus";

const key = stringifySudoku(ISSUE_33_CUSTOM_SUDOKU.unsolved);
const recordKey = "super_sudoku_1_6_" + key;
const compactKey = "super_sudoku_1_7_" + key;
const currentKey = "super_sudoku_currently_playing_sudoku";
const cells = simpleSudokuToCells(ISSUE_33_CUSTOM_SUDOKU.unsolved, ISSUE_33_CUSTOM_SUDOKU.solved);
const completed = cells.map((cell) => ({...cell, number: cell.solution}));
const wonGame = {
  ...INITIAL_GAME_STATE,
  sudokuCollectionName: "custom",
  sudokuIndex: 5,
  won: true,
  timesSolved: 2,
  previousTimes: [96, 75],
  secondsPlayed: 75,
};

beforeEach(() => {
  const records: Record<string, string> = Object.create({
    getItem: (key: string) => records[key] ?? null,
    setItem: (key: string, value: string) => {
      records[key] = value;
    },
    removeItem: (key: string) => {
      delete records[key];
    },
  });
  vi.stubGlobal("localStorage", records);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("played puzzle storage", () => {
  it("round-trips a compact win and the subsequent unfinished replay", () => {
    repository.saveSudokuState(wonGame, {current: completed});
    const packed = localStorage.getItem(compactKey)!;
    expect(packed.length).toBeLessThan(JSON.stringify({game: wonGame, sudoku: completed}).length / 5);
    expect(getCurrentSudokuFromStorage()).toEqual({game: wonGame, sudoku: completed});

    const game = {...wonGame, won: false, state: GameStateMachine.running, secondsPlayed: 9};
    const current = cells.map((cell, i) =>
      i === 0 ? {...cell, notes: [2, 4]} : i === 1 ? {...cell, number: 2} : cell,
    );
    repository.saveSudokuState(game, {current});
    expect(getCurrentSudokuFromStorage()).toEqual({game, sudoku: current});
    expect(localStorage.getItem(compactKey)).toBeNull();
  });

  it.each(["1_0", "1_1", "1_2", "1_3", "1_4", "1_5"])(
    "restores the active puzzle and completion times from %s",
    (version) => {
      const archiveKey = `super_sudoku_${version}_use_this_file_if_you_want_to_cheat`;
      const active = version === "1_5" ? key : 0;
      const stats = version === "1_4" || version === "1_5" ? {timesSolved: 2, previousTimes: [96, 75]} : {};
      const timer = version === "1_0" ? {startTime: 1000, stopTime: 81000, offsetTime: 5000} : {secondsPlayed: 75};
      const game = {difficulty: "hard", sudokuIndex: 5, state: "WON_GAME", won: false, ...timer, ...stats};
      localStorage.setItem(archiveKey, JSON.stringify({active, sudokus: {[active]: {game, sudoku: completed}}}));

      expect(repository.getCurrentSudokuKey()).toBe(key);
      expect(getCurrentSudokuFromStorage()).toMatchObject({
        game: {
          sudokuIndex: 5,
          sudokuCollectionName: "hard",
          state: GameStateMachine.paused,
          won: true,
          timesSolved: 1,
          previousTimes: [75],
          secondsPlayed: 75,
          ...stats,
        },
        sudoku: completed,
      });
      expect(localStorage.getItem(archiveKey)).toBeNull();
      expect(JSON.parse(localStorage.getItem(compactKey)!)).toHaveProperty("completedGrid");
    },
  );

  it("preserves an unfinished v1.6 game and its active pointer when an older archive coexists", () => {
    const game = {difficulty: "expert", won: false, secondsPlayed: 37, timesSolved: 1, previousTimes: [92]};
    const current = cells.map((cell, i) => (i === 0 ? {...cell, notes: [4, 6]} : cell));
    localStorage.setItem(recordKey, JSON.stringify({game, sudoku: current}));
    localStorage.setItem(currentKey, key);
    const otherCells = cells.map((cell, i) => (i === 0 ? {...cell, initial: true, number: cell.solution} : cell));
    const otherKey = String(otherCells[0].number) + key.slice(1);
    localStorage.setItem(
      "super_sudoku_1_4_use_this_file_if_you_want_to_cheat",
      JSON.stringify({
        active: 7,
        sudokus: {6: {game: wonGame, sudoku: completed}, 7: {game, sudoku: otherCells}},
      }),
    );
    expect(repository.getSudokuState(otherKey)?.sudoku).toEqual(otherCells);
    expect(repository.getCurrentSudokuKey()).toBe(key);
    expect(getCurrentSudokuFromStorage()).toMatchObject({
      game: {...game, sudokuCollectionName: "expert"},
      sudoku: current,
    });
  });

  it("keeps the current win readable after rollback and retains only its compact history when switching", () => {
    // Start with the compact record that PR #45 published in the v1.6 namespace.
    const packed = {game: wonGame, completedGrid: stringifySudoku(ISSUE_33_CUSTOM_SUDOKU.solved)};
    localStorage.setItem(recordKey, JSON.stringify(packed));
    localStorage.setItem(currentKey, key);
    expect(getCurrentSudokuFromStorage()).toEqual({game: wonGame, sudoku: completed});
    expect(JSON.parse(localStorage.getItem(compactKey)!)).toEqual(packed);
    // The pre-PR reader dereferences this key and reads its sudoku array directly.
    expect(JSON.parse(localStorage.getItem(recordKey)!).sudoku).toEqual(completed);
    expect(repository.getPlayedSudokus()).toEqual([recordKey]);
    const next = cells.map((cell, i) => (i === 0 ? {...cell, initial: true, number: cell.solution} : cell));
    repository.saveSudokuState(INITIAL_GAME_STATE, {current: next});
    expect(localStorage.getItem(recordKey)).toBeNull();
    expect(repository.getSudokuState(key)).toEqual({game: wonGame, sudoku: completed});
  });

  it("reads older archives while a newer migration is blocked and preserves precedence on retry", () => {
    const oldKey = "super_sudoku_1_4_use_this_file_if_you_want_to_cheat";
    const newKey = "super_sudoku_1_5_use_this_file_if_you_want_to_cheat";
    const olderCells = cells.map((cell, i) => (i === 0 ? {...cell, initial: true, number: cell.solution} : cell));
    const olderKey = olderCells[0].number + key.slice(1);
    const older = {...INITIAL_GAME_STATE, secondsPlayed: 73};
    localStorage.setItem(
      oldKey,
      JSON.stringify({
        active: 1,
        sudokus: {
          1: {game: older, sudoku: olderCells},
          2: {game: older, sudoku: cells},
        },
      }),
    );
    localStorage.setItem(newKey, JSON.stringify({active: key, sudokus: {[key]: {game: wonGame, sudoku: completed}}}));
    const setItem = localStorage.setItem.bind(localStorage);
    const write = vi.spyOn(localStorage, "setItem").mockImplementation((destination, value) => {
      if (destination === compactKey) {
        throw new DOMException("Full", "QuotaExceededError");
      }
      setItem(destination, value);
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(repository.getSudokuState(olderKey)?.game.secondsPlayed).toBe(73);
    expect(getCurrentSudokuFromStorage()?.game).toEqual(wonGame);
    expect(localStorage.getItem(oldKey)).not.toBeNull();
    write.mockRestore();
    expect(repository.getSudokuState(olderKey)?.game.secondsPlayed).toBe(73);
    expect(getCurrentSudokuFromStorage()?.game).toEqual(wonGame);
    expect(localStorage.getItem(oldKey)).toBeNull();
  });

  it("keeps legacy progress readable if migration cannot finish writing", () => {
    const archiveKey = "super_sudoku_1_5_use_this_file_if_you_want_to_cheat";
    localStorage.setItem(
      archiveKey,
      JSON.stringify({active: key, sudokus: {[key]: {game: wonGame, sudoku: completed}}}),
    );
    const setItem = localStorage.setItem.bind(localStorage);
    const failWrite = vi.spyOn(localStorage, "setItem").mockImplementation((destination, value) => {
      if (destination === compactKey) {
        throw new DOMException("Full", "QuotaExceededError");
      }
      setItem(destination, value);
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(getCurrentSudokuFromStorage()).toEqual({game: wonGame, sudoku: completed});
    expect(localStorage.getItem(archiveKey)).not.toBeNull();
    failWrite.mockRestore();
    expect(getCurrentSudokuFromStorage()).toEqual({game: wonGame, sudoku: completed});
    expect(localStorage.getItem(archiveKey)).toBeNull();
  });
});
