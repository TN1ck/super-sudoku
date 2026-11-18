import {GameState, GameStateMachine, INITIAL_GAME_STATE} from "src/context/GameContext";
import {SudokuState} from "src/context/SudokuContext";
import {Cell} from "src/lib/engine/types";
import {stringifySudoku, cellsToSimpleSudoku, parseSudoku, simpleSudokuToCells} from "src/lib/engine/utility";

const LEGACY_KEYS = ["1_5", "1_4", "1_3", "1_2", "1_1", "1_0"].map(
  (version) => `super_sudoku_${version}_use_this_file_if_you_want_to_cheat`,
);
const STORAGE_KEY_V_1_6_PREFIX = "super_sudoku_1_6_";
const STORAGE_KEY_V_1_7_PREFIX = "super_sudoku_1_7_";
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
    const sudoku = record.sudoku.map((cell) =>
      cell.initial && cell.solution === undefined ? {...cell, solution: cell.number} : cell,
    );
    return {game, sudoku};
  }
  const cells = simpleSudokuToCells(parseSudoku(key), parseSudoku(record.completedGrid));
  return {game, sudoku: cells.map((cell) => ({...cell, number: cell.solution}))};
}

function getPlayedKeys() {
  const keys = new Set(Object.keys(localStorage));
  return [...keys].filter((key) => {
    if (key.startsWith(STORAGE_KEY_V_1_6_PREFIX)) {
      return true;
    }
    return (
      key.startsWith(STORAGE_KEY_V_1_7_PREFIX) &&
      !keys.has(STORAGE_KEY_V_1_6_PREFIX + key.slice(STORAGE_KEY_V_1_7_PREFIX.length))
    );
  });
}

function writeRecord(key: string, record: SavedSudoku, activeWin?: StoredPlayedSudokuState) {
  const fullKey = STORAGE_KEY_V_1_6_PREFIX + key;
  const compactKey = STORAGE_KEY_V_1_7_PREFIX + key;
  if ("completedGrid" in record) {
    localStorage.setItem(compactKey, JSON.stringify(record));
    if (activeWin) {
      // Keep a single full snapshot so the previous release can resume the active win.
      try {
        localStorage.setItem(fullKey, JSON.stringify({...activeWin, activeWinSnapshot: true}));
        return;
      } catch (error) {
        if (!isQuotaError(error)) {
          throw error;
        }
        // The compact win is already durable if even the optional snapshot cannot fit.
      }
    }
    localStorage.removeItem(fullKey);
  } else {
    localStorage.setItem(fullKey, JSON.stringify(record));
    localStorage.removeItem(compactKey);
  }
}

// A fixed clue already carries its answer in `number`. Older releases never
// request a hint for a fixed clue. Keep all 81 cells and every editable hint.
function shrinkFullRecord(record: StoredPlayedSudokuState) {
  const sudoku = record.sudoku.map((cell) =>
    cell.initial && cell.solution === cell.number ? {...cell, solution: undefined} : cell,
  );
  return {...record, sudoku};
}

function compactOldCompletions() {
  for (const storageKey of Object.keys(localStorage)) {
    if (!storageKey.startsWith(STORAGE_KEY_V_1_6_PREFIX)) {
      continue;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        continue;
      }
      const record: SavedSudoku = JSON.parse(raw);
      const smaller = compact({...record, game: normalizeGame(record.game)});
      if ("completedGrid" in smaller) {
        const key = storageKey.slice(STORAGE_KEY_V_1_6_PREFIX.length);
        try {
          writeRecord(key, smaller);
        } catch (error) {
          if (!isQuotaError(error) || !("sudoku" in record)) {
            throw error;
          }
          // At the quota there may be no room for a second key. Keep the completed
          // board readable in place, omitting hint values already present as answers.
          const checkpoint = JSON.stringify(shrinkFullRecord(record));
          if (checkpoint.length >= raw.length) {
            throw error;
          }
          localStorage.setItem(storageKey, checkpoint);
          writeRecord(key, smaller);
        }
      }
    } catch (error) {
      console.warn("Could not compact saved puzzle", storageKey, error);
    }
  }
}

interface PuzzleArchive<Active = string> {
  active: Active;
  sudokus: Record<string, SavedSudoku>;
}

// Before v1.5 both the active pointer and the archive entries used numeric IDs.
function legacyPuzzleKey(id: string, record: SavedSudoku) {
  return "sudoku" in record ? puzzleKey(record.sudoku) : id;
}

function readLegacyArchive(archive: PuzzleArchive<number | string>, storageKey: string): PuzzleArchive {
  const sudokus: Record<string, SavedSudoku> = {};
  // After a partial migration the active puzzle may already be in its own record.
  let active = typeof archive.active === "string" ? archive.active : "";
  for (const [id, record] of Object.entries(archive.sudokus)) {
    const key = legacyPuzzleKey(id, record);
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

function copyLegacyArchive(
  source: PuzzleArchive<number | string>,
  archive: PuzzleArchive,
  storageKey: string,
  archiveSize: number,
) {
  const remaining = {...source.sudokus};
  const write = (destination: string, value: string) => {
    try {
      localStorage.setItem(destination, value);
    } catch (error) {
      if (!isQuotaError(error)) {
        throw error;
      }
      // Release space atomically. Every puzzle is still in the archive or its own record.
      const sudokus = Object.fromEntries(
        Object.entries(remaining).map(([id, record]) => {
          const key = legacyPuzzleKey(id, record);
          const full = "sudoku" in record ? record : restore(record, key);
          return [id, "completedGrid" in archive.sudokus[key] ? shrinkFullRecord(full) : full];
        }),
      );
      const backup = JSON.stringify({...source, sudokus});
      if (backup.length >= archiveSize) {
        throw error;
      }
      localStorage.setItem(storageKey, backup);
      archiveSize = backup.length;
      localStorage.setItem(destination, value);
    }
  };

  for (const [id, sourceRecord] of Object.entries(source.sudokus)) {
    const key = legacyPuzzleKey(id, sourceRecord);
    const record = archive.sudokus[key];
    const fullKey = STORAGE_KEY_V_1_6_PREFIX + key;
    const compactKey = STORAGE_KEY_V_1_7_PREFIX + key;
    if (localStorage.getItem(fullKey) === null && localStorage.getItem(compactKey) === null) {
      write("completedGrid" in record ? compactKey : fullKey, JSON.stringify(record));
    }
    // Preserve numeric active IDs through an interrupted migration.
    if (id !== String(source.active)) {
      delete remaining[id];
    }
  }
  if (archive.active && !localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY)) {
    write(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, archive.active);
  }
}

function migrateLegacyStorage(): PuzzleArchive {
  const migrated: PuzzleArchive = {active: "", sudokus: {}};
  let canCopy = true;
  for (const storageKey of LEGACY_KEYS) {
    const text = localStorage.getItem(storageKey);
    if (!text) {
      continue;
    }
    let archive: PuzzleArchive;
    let source: PuzzleArchive<number | string>;
    try {
      source = JSON.parse(text);
      archive = readLegacyArchive(source, storageKey);
    } catch (error) {
      console.warn("Could not read saved puzzles", storageKey, error);
      continue;
    }
    migrated.sudokus = {...archive.sudokus, ...migrated.sudokus};
    migrated.active ||= archive.active;

    if (!canCopy) {
      continue;
    }
    try {
      copyLegacyArchive(source, archive, storageKey, text.length);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Could not finish migrating saved puzzles", storageKey, error);
      // Read older saves too, but never let an older copy overwrite the one that failed to migrate.
      canCopy = false;
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
  const full = localStorage.getItem(STORAGE_KEY_V_1_6_PREFIX + key);
  if (full) {
    const record: SavedSudoku = JSON.parse(full);
    const restored = restore(record, key);
    // PR #45 briefly wrote compact wins under the v1.6 prefix.
    if ("completedGrid" in record) {
      try {
        const active = localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY) === key;
        writeRecord(key, record, active ? restored : undefined);
      } catch (error) {
        console.warn("Could not migrate completed puzzle", key, error);
      }
    }
    return restored;
  }
  const raw = localStorage.getItem(STORAGE_KEY_V_1_7_PREFIX + key);
  const record: SavedSudoku | undefined = raw ? JSON.parse(raw) : migrateLegacyStorage().sudokus[key];
  return record ? restore(record, key) : undefined;
}

function saveCurrentSudokuToLocalStorage(game: GameState, sudoku: Pick<SudokuState, "current">) {
  const key = puzzleKey(sudoku.current);
  const full = {game, sudoku: sudoku.current};
  const record = compact(full);
  const save = () => {
    const previous = localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY);
    writeRecord(key, record, full);
    localStorage.setItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, key);
    if (previous && previous !== key && localStorage.getItem(STORAGE_KEY_V_1_7_PREFIX + previous)) {
      const previousKey = STORAGE_KEY_V_1_6_PREFIX + previous;
      const snapshot = localStorage.getItem(previousKey);
      if (snapshot && JSON.parse(snapshot).activeWinSnapshot) {
        localStorage.removeItem(previousKey);
      }
    }
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
    localStorage.removeItem(STORAGE_KEY_V_1_7_PREFIX + sudokuKey);
  },
};
