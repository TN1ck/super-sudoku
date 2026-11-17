import {GameState, GameStateMachine, INITIAL_GAME_STATE} from "src/context/GameContext";
import {SudokuState} from "src/context/SudokuContext";
import {Cell} from "src/lib/engine/types";
import {stringifySudoku, cellsToSimpleSudoku, parseSudoku, simpleSudokuToCells} from "src/lib/engine/utility";

const LEGACY_KEYS = ["1_5", "1_4", "1_3", "1_2", "1_1", "1_0"].map(
  (version) => `super_sudoku_${version}_use_this_file_if_you_want_to_cheat`,
);
const STORAGE_KEY_V_1_6_PREFIX = "super_sudoku_1_6_";
const STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY = "super_sudoku_currently_playing_sudoku";

export interface StoredPlayedSudokuState {
  game: GameState;
  sudoku: Cell[];
}

interface CompletedSudoku {
  game: GameState;
  completedGrid: string;
}

type SavedSudoku = StoredPlayedSudokuState | CompletedSudoku;

function puzzleKey(cells: Cell[]) {
  return stringifySudoku(cellsToSimpleSudoku(cells));
}

function compact(record: SavedSudoku): SavedSudoku {
  if (
    "sudoku" in record &&
    record.game.won &&
    record.sudoku.length === 81 &&
    record.sudoku.every((c) => c.number > 0)
  ) {
    // Keep the player's actual solution, including for custom or shared puzzles.
    return {game: record.game, completedGrid: record.sudoku.map((c) => c.number).join("")};
  }
  return record;
}

interface LegacyGame extends Partial<Omit<GameState, "state">> {
  difficulty?: string;
  state?: string;
  startTime?: number;
  stopTime?: number;
  offsetTime?: number;
}

function normalizeGame(game: LegacyGame, lastActiveTime = 0): GameState {
  const won = game.won === true || game.state === "WON_GAME";
  // v1.0 stored timestamps and the time spent paused, all in milliseconds.
  const stopTime = game.stopTime || lastActiveTime;
  const elapsedMs = game.startTime && stopTime ? Math.max(0, stopTime - game.startTime - (game.offsetTime ?? 0)) : 0;
  const secondsPlayed = game.secondsPlayed ?? elapsedMs / 1000;
  return {
    ...INITIAL_GAME_STATE,
    ...game,
    sudokuCollectionName: game.sudokuCollectionName || game.difficulty || INITIAL_GAME_STATE.sudokuCollectionName,
    won,
    secondsPlayed,
    state: !won && game.state === GameStateMachine.running ? GameStateMachine.running : GameStateMachine.paused,
    timesSolved: game.timesSolved ?? (won ? 1 : 0),
    previousTimes: game.previousTimes ?? (won ? [secondsPlayed] : []),
  };
}

function restore(record: SavedSudoku, key: string): StoredPlayedSudokuState {
  const game = normalizeGame(record.game);
  if ("sudoku" in record) {
    return {game, sudoku: record.sudoku};
  }
  const cells = simpleSudokuToCells(parseSudoku(key), parseSudoku(record.completedGrid));
  return {game, sudoku: cells.map((cell) => ({...cell, number: cell.solution}))};
}

function getPlayedKeys() {
  return Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_KEY_V_1_6_PREFIX));
}

function compactOldCompletions() {
  for (const key of getPlayedKeys()) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }
      const record: SavedSudoku = JSON.parse(raw);
      if ("sudoku" in record) {
        const smaller = compact({...record, game: normalizeGame(record.game)});
        if ("completedGrid" in smaller) {
          localStorage.setItem(key, JSON.stringify(smaller));
        }
      }
    } catch (error) {
      console.warn("Could not compact saved puzzle", key, error);
    }
  }
}

interface PuzzleArchive {
  active: string;
  sudokus: Record<string, SavedSudoku>;
}

// Before v1.5 both the active pointer and the archive entries used numeric IDs.
function readLegacyArchive(text: string, storageKey: string): PuzzleArchive {
  const archive: {active: number | string; sudokus: Record<string, SavedSudoku>} = JSON.parse(text);
  const sudokus: Record<string, SavedSudoku> = {};
  // After a partial migration the active puzzle may already be in its own record.
  let active = typeof archive.active === "string" ? archive.active : "";
  for (const [id, record] of Object.entries(archive.sudokus)) {
    const key = "sudoku" in record ? puzzleKey(record.sudoku) : id;
    const isActive = archive.active !== -1 && id === String(archive.active);
    const lastActiveTime = isActive ? Number(localStorage.getItem(storageKey + "_stop_time")) : 0;
    sudokus[key] = compact({...record, game: normalizeGame(record.game, lastActiveTime)});
    if (isActive) {
      active = key;
    }
  }
  return {active, sudokus};
}

function isQuotaError(error: unknown) {
  return error instanceof DOMException && error.name === "QuotaExceededError";
}

function copyLegacyArchive(archive: PuzzleArchive, storageKey: string, archiveSize: number) {
  const remaining = {...archive.sudokus};
  const write = (destination: string, value: string) => {
    try {
      localStorage.setItem(destination, value);
    } catch (error) {
      if (!isQuotaError(error)) {
        throw error;
      }
      // Release space atomically. Every puzzle is still in the archive or its own record.
      const backup = JSON.stringify({active: archive.active, sudokus: remaining});
      if (backup.length >= archiveSize) {
        throw error;
      }
      localStorage.setItem(storageKey, backup);
      archiveSize = backup.length;
      localStorage.setItem(destination, value);
    }
  };

  for (const [key, record] of Object.entries(archive.sudokus)) {
    const destination = STORAGE_KEY_V_1_6_PREFIX + key;
    if (localStorage.getItem(destination) === null) {
      write(destination, JSON.stringify(record));
    }
    delete remaining[key];
  }
  if (archive.active && !localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY)) {
    write(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, archive.active);
  }
}

function migrateLegacyStorage(): PuzzleArchive {
  const migrated: PuzzleArchive = {active: "", sudokus: {}};
  for (const storageKey of LEGACY_KEYS) {
    const text = localStorage.getItem(storageKey);
    if (!text) {
      continue;
    }
    let archive: PuzzleArchive;
    try {
      archive = readLegacyArchive(text, storageKey);
    } catch (error) {
      console.warn("Could not read saved puzzles", storageKey, error);
      continue;
    }
    migrated.sudokus = {...archive.sudokus, ...migrated.sudokus};
    migrated.active ||= archive.active;

    try {
      copyLegacyArchive(archive, storageKey, text.length);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Could not finish migrating saved puzzles", storageKey, error);
      // Keep the remaining archive readable and retry the migration on a later access.
      break;
    }
  }
  return migrated;
}

function getCurrentSudokuKey(): string | null {
  return localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY) || migrateLegacyStorage().active || null;
}

export function getCurrentSudokuFromStorage(): StoredPlayedSudokuState | undefined {
  const key = getCurrentSudokuKey();
  return key ? getSudokuFromStorage(key) : undefined;
}

function getSudokuFromStorage(key: string): StoredPlayedSudokuState | undefined {
  const raw = localStorage.getItem(STORAGE_KEY_V_1_6_PREFIX + key);
  const record: SavedSudoku | undefined = raw ? JSON.parse(raw) : migrateLegacyStorage().sudokus[key];
  return record ? restore(record, key) : undefined;
}

function saveCurrentSudokuToLocalStorage(game: GameState, sudoku: Pick<SudokuState, "current">) {
  const key = puzzleKey(sudoku.current);
  const value = JSON.stringify(compact({game, sudoku: sudoku.current}));
  const save = () => {
    localStorage.setItem(STORAGE_KEY_V_1_6_PREFIX + key, value);
    localStorage.setItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, key);
  };
  try {
    save();
  } catch (error) {
    if (isQuotaError(error)) {
      compactOldCompletions();
      try {
        save();
      } catch (retryError) {
        console.error("Could not save the current sudoku after compacting old wins.", retryError);
      }
      return;
    }
    console.error("Could not save the current sudoku.", error);
  }
}

export const localStoragePlayedSudokuRepository = {
  getPlayedSudokus: getPlayedKeys,
  getCurrentSudokuKey,
  saveCurrentSudokuKey(sudokuKey: string): void {
    localStorage.setItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, sudokuKey);
  },
  getSudokuState: getSudokuFromStorage,
  saveSudokuState: saveCurrentSudokuToLocalStorage,
  removeSudokuState(sudokuKey: string): void {
    localStorage.removeItem(STORAGE_KEY_V_1_6_PREFIX + sudokuKey);
  },
};
