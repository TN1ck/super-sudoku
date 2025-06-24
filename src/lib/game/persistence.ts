import {GameState, GameStateMachine} from "src/context/GameContext";
import {SudokuState} from "src/context/SudokuContext";
import {Cell} from "src/lib/engine/types";
import {stringifySudoku, cellsToSimpleSudoku} from "src/lib/engine/utility";

const STORAGE_KEY_V_1_3 = "super_sudoku_1_3_use_this_file_if_you_want_to_cheat";
const STORAGE_KEY_V_1_4 = "super_sudoku_1_4_use_this_file_if_you_want_to_cheat";
const STORAGE_KEY_V_1_5 = "super_sudoku_1_5_use_this_file_if_you_want_to_cheat";

export interface StoredSudokuState {
  game: GameState;
  sudoku: Cell[];
}

interface StoredState {
  active: string;
  sudokus: {
    [key: string]: StoredSudokuState;
  };
}

const loadFromLocalStorage = (): StoredState => {
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
  }
  if (text === null) {
    usedKey = STORAGE_KEY_V_1_3;
    text = localStorage.getItem(STORAGE_KEY_V_1_3);
  }
  if (text !== null) {
    try {
      // TODO: add validation
      const result = JSON.parse(text) as StoredState;

      // Migrate from numeric IDs to stringified sudoku keys
      if (usedKey === STORAGE_KEY_V_1_3 || usedKey === STORAGE_KEY_V_1_4) {
        const migratedSudokus: {[key: string]: StoredSudokuState} = {};
        const keys = Object.keys(result.sudokus);

        for (const key of keys) {
          const numberKey = parseInt(key, 10);
          if (isNaN(numberKey)) {
            continue;
          }
          const sudoku = result.sudokus[numberKey];

          // Migrate missing timesSolved and previousTimes.
          if (usedKey === STORAGE_KEY_V_1_3) {
            if (sudoku.game.state === GameStateMachine.wonGame) {
              sudoku.game.timesSolved = 1;
              sudoku.game.previousTimes = [sudoku.game.secondsPlayed];
            } else {
              sudoku.game.timesSolved = 0;
              sudoku.game.previousTimes = [];
            }
          }

          // Make sure that conflicts are shown by default. Doesn't warrant a new persistence key.
          if (sudoku.game.showConflicts === undefined) {
            sudoku.game.showConflicts = true;
          }

          // Convert numeric ID to stringified sudoku key
          const sudokuKey = stringifySudoku(cellsToSimpleSudoku(sudoku.sudoku));

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
      console.error("File corrupted: will delete and save as corrupted.");
      localStorage.setItem(STORAGE_KEY_V_1_5 + "_corrupted_" + new Date().toISOString(), text);
      localStorage.removeItem(STORAGE_KEY_V_1_5);
      return empty;
    }
  }
  return empty;
};

// TODO: this is problematic with multiple open windows, as the .active gets overwritten.
// We should have a tab based storage for that stuff as well, so a reload does not open the other sudoku.
export const saveToLocalStorage = (game: GameState, sudoku: SudokuState) => {
  const cached = loadFromLocalStorage();
  const sudokuKey = stringifySudoku(cellsToSimpleSudoku(sudoku.current));
  cached.active = sudokuKey;
  // We do not save the history as it would take too much space.
  // Also we don't need to to migrate the existing data.
  cached.sudokus[sudokuKey] = {game, sudoku: sudoku.current};
  try {
    localStorage.setItem(STORAGE_KEY_V_1_5, JSON.stringify(cached));
  } catch (e) {
    console.error("LocalStorage is not supported! No Saving possible.", e);
  }
};

export const getState = () => {
  const cached = loadFromLocalStorage();
  return cached;
};
