import {GameState} from "src/context/GameContext";
import {SudokuState} from "src/context/SudokuContext";
import {Cell} from "src/lib/engine/types";
import {stringifySudoku, cellsToSimpleSudoku} from "src/lib/engine/utility";

const STORAGE_KEY_V_1_4 = "super_sudoku_1_4_use_this_file_if_you_want_to_cheat";
const STORAGE_KEY_V_1_5 = "super_sudoku_1_5_use_this_file_if_you_want_to_cheat";
const STORAGE_KEY_V_1_6_PREFIX = "super_sudoku_1_6_";
const STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY = "super_sudoku_currently_playing_sudoku";

export interface StoredPlayedSudokuState {
  game: GameState;
  sudoku: Cell[];
}

interface StoredPlayedSudokusState {
  active: string;
  sudokus: {
    [key: string]: StoredPlayedSudokuState;
  };
}

// Before version 1.6, we had one storage key for all sudokus.
// Now we have one storage key for each sudoku.
// This function loads the sudokus from the old storage key.
const legacyLoadPlayedSudokusFromLocalStorage = (): StoredPlayedSudokusState => {
  const empty = {
    active: "",
    sudokus: {},
    application: undefined,
  };
  if (typeof localStorage === "undefined") {
    return empty;
  }
  let usedKey = STORAGE_KEY_V_1_5;
  let text = localStorage.getItem(STORAGE_KEY_V_1_5);
  // Try older versions.
  if (text === null) {
    usedKey = STORAGE_KEY_V_1_4;
    text = localStorage.getItem(STORAGE_KEY_V_1_4);
    console.log("using v1.4", text);
  }
  if (text !== null) {
    try {
      // TODO: add validation
      const result = JSON.parse(text) as StoredPlayedSudokusState;

      // Migrate from numeric IDs to stringified sudoku keys
      if (usedKey === STORAGE_KEY_V_1_4) {
        const migratedSudokus: {[key: string]: StoredPlayedSudokuState} = {};
        const keys = Object.keys(result.sudokus);
        console.log("keys", keys);

        for (const key of keys) {
          const numberKey = parseInt(key, 10);
          if (isNaN(numberKey)) {
            continue;
          }
          const sudoku = result.sudokus[numberKey];

          // Convert numeric ID to stringified sudoku key
          const sudokuKey = stringifySudoku(cellsToSimpleSudoku(sudoku.sudoku));
          console.log("migrated sudoku:", numberKey, "to", sudokuKey);

          migratedSudokus[sudokuKey] = sudoku;
        }

        result.sudokus = migratedSudokus;
        result.active =
          typeof result.active === "number" && result.active !== -1
            ? stringifySudoku(cellsToSimpleSudoku(result.sudokus[result.active]?.sudoku || []))
            : "";
      }

      return result;
    } catch (e) {
      // delete entry but save it as corrupted, so one might be able to restore it
      console.error("File corrupted: will delete and save as corrupted.", e);
      localStorage.setItem(STORAGE_KEY_V_1_5 + "_corrupted_" + new Date().toISOString(), text);
      localStorage.removeItem(STORAGE_KEY_V_1_5);
      return empty;
    }
  }
  return empty;
};

export function getCurrentSudokuFromStorage(): StoredPlayedSudokuState | undefined {
  const sudokuKey = localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY);
  if (sudokuKey) {
    return getSudokuFromStorage(sudokuKey);
  }
  return undefined;
}

function getSudokuFromStorage(sudokuKey: string): StoredPlayedSudokuState | undefined {
  // V1.6
  const sudokuFromStorage = localStorage.getItem(createSudokuKey(sudokuKey));
  if (sudokuFromStorage) {
    const sudoku = JSON.parse(sudokuFromStorage) as StoredPlayedSudokuState;
    // There is a bug that the collection name might not be set, then we just use the difficulty.
    const difficulty = (sudoku.game as any).difficulty;
    if (!sudoku.game.sudokuCollectionName && difficulty) {
      sudoku.game.sudokuCollectionName = difficulty;
    }
    return sudoku;
  }

  // TODO: Remove after a year (today is 2025-06-28).
  // No old storage found.
  if (localStorage.getItem(STORAGE_KEY_V_1_5) === null && localStorage.getItem(STORAGE_KEY_V_1_4) === null) {
    return undefined;
  }

  // V1.5
  const sudokusFromStorage = legacyLoadPlayedSudokusFromLocalStorage();
  // Migrate to V1.6
  for (const sudokuKey of Object.keys(sudokusFromStorage.sudokus)) {
    const sudoku = sudokusFromStorage.sudokus[sudokuKey];
    const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudoku.sudoku));
    localStorage.setItem(createSudokuKey(stringifiedSudoku), JSON.stringify(sudoku));
  }
  // Delete old storage.
  localStorage.removeItem(STORAGE_KEY_V_1_5);
  localStorage.removeItem(STORAGE_KEY_V_1_4);

  // Try again, as now we have the new storage key.
  return getSudokuFromStorage(sudokuKey);
}

function createSudokuKey(stringifiedSudoku: string) {
  return STORAGE_KEY_V_1_6_PREFIX + stringifiedSudoku;
}

const saveCurrentSudokuToLocalStorage = (game: GameState, sudoku: SudokuState) => {
  const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudoku.current));
  const sudokuKey = createSudokuKey(stringifiedSudoku);
  // We do not save the history as it would take too much space.
  // Also we don't need to to migrate the existing data.
  try {
    localStorage.setItem(sudokuKey, JSON.stringify({game, sudoku: sudoku.current}));
    // TODO: this is problematic with multiple open windows, as the .active gets overwritten.
    // We should have a tab based storage for that stuff as well, so a reload does not open the other sudoku.
    localStorage.setItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, stringifiedSudoku);
  } catch (e) {
    console.error("LocalStorage is not supported! No Saving possible.", e);
  }
};

interface PlayedSudokuRepository {
  getPlayedSudokus(): string[];
  getCurrentSudokuKey(): string | null;
  saveCurrentSudokuKey(sudokuKey: string): void;
  getSudokuState(sudokuKey: string): StoredPlayedSudokuState | undefined;
  saveSudokuState(game: GameState, sudoku: SudokuState): void;
  removeSudokuState(sudokuKey: string): void;
}

export const localStoragePlayedSudokuRepository: PlayedSudokuRepository = {
  getPlayedSudokus(): string[] {
    return Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_KEY_V_1_6_PREFIX));
  },
  getCurrentSudokuKey(): string | null {
    return localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY);
  },
  saveCurrentSudokuKey(sudokuKey: string): void {
    localStorage.setItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, sudokuKey);
  },
  getSudokuState(sudokuKey: string): StoredPlayedSudokuState | undefined {
    return getSudokuFromStorage(sudokuKey);
  },
  saveSudokuState(game: GameState, sudoku: SudokuState): void {
    saveCurrentSudokuToLocalStorage(game, sudoku);
  },
  removeSudokuState(sudokuKey: string): void {
    localStorage.removeItem(createSudokuKey(sudokuKey));
  },
};
