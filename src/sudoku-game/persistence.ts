import SUDOKUS from "src/sudoku-game/sudokus";
import {GameState, GameStateMachine} from "src/state/game";
import {SudokuState} from "src/state/sudoku";
import {ApplicationState} from "src/state/application";
import {Cell} from "src/engine/types";

const STORAGE_KEY_V_1_3 = "super_sudoku_1_3_use_this_file_if_you_want_to_cheat";
const STORAGE_KEY_V_1_4 = "super_sudoku_1_4_use_this_file_if_you_want_to_cheat";

export interface StoredSudokuState {
  game: GameState;
  sudoku: Cell[];
}

interface StoredState {
  active: number;
  application: ApplicationState | undefined;
  sudokus: {
    [key: number]: StoredSudokuState;
  };
}

const loadFromLocalStorage = (): StoredState => {
  const empty = {
    active: -1,
    sudokus: {},
    application: undefined,
  };
  if (typeof localStorage === "undefined") {
    return empty;
  }
  let usedKey = STORAGE_KEY_V_1_4;
  let text = localStorage.getItem(STORAGE_KEY_V_1_4);
  // Try older versions.
  if (text === null) {
    usedKey = STORAGE_KEY_V_1_3;
    text = localStorage.getItem(STORAGE_KEY_V_1_3);
  }
  if (text !== null) {
    try {
      // TODO: add validation
      const result = JSON.parse(text) as StoredState;
      // Migrate missing timesSolved and previousTimes.
      if (usedKey === STORAGE_KEY_V_1_3) {
        const keys = Object.keys(result.sudokus);
        for (const key of keys) {
          const numberKey = parseInt(key, 10);
          if (isNaN(numberKey)) {
            continue;
          }
          const sudoku = result.sudokus[numberKey];
          if (sudoku.game.state === GameStateMachine.wonGame) {
            sudoku.game.timesSolved = 1;
            sudoku.game.previousTimes = [sudoku.game.secondsPlayed];
          } else {
            sudoku.game.timesSolved = 0;
            sudoku.game.previousTimes = [];
          }
          result.sudokus[numberKey] = sudoku;
        }
      }

      // Make sure that conflicts are shown by default. Doesn't warrant a new persistance key.
      const keys = Object.keys(result.sudokus);
      for (const key of keys) {
        const numberKey = parseInt(key, 10);
        if (isNaN(numberKey)) {
          continue;
        }
        const sudoku = result.sudokus[numberKey];
        if (sudoku.game.showConflicts === undefined) {
          sudoku.game.showConflicts = true;
        }
        result.sudokus[numberKey] = sudoku;
      }

      return result;
    } catch (e) {
      // delete entry but save it as corrupted, so one might be able to restore it
      console.error("File corrupted: will delete and save as corrupted.");
      localStorage.setItem(STORAGE_KEY_V_1_4 + "_corrupted_" + new Date().toISOString(), text);
      localStorage.removeItem(STORAGE_KEY_V_1_4);
      return empty;
    }
  }
  return empty;
};

// TODO: this is problematic with multiple open windows, as the .active gets overwritten.
// We should have a tab based storage for that stuff as well, so a reload does not open the other sudoku.
export const saveToLocalStorage = (application: ApplicationState, game: GameState, sudoku: SudokuState) => {
  const cached = loadFromLocalStorage();
  cached.active = game.sudokuId;
  cached.application = application;
  // We do not save the history as it would take too much space.
  // Also we don't need to to migrate the existing data.
  cached.sudokus[game.sudokuId] = {game, sudoku: sudoku.current};
  try {
    localStorage.setItem(STORAGE_KEY_V_1_4, JSON.stringify(cached));
  } catch (e) {
    console.error("LocalStorage is not supported! No Saving possible.", e);
  }
};

export const getState = () => {
  const cached = loadFromLocalStorage();
  return cached;
};

export default SUDOKUS;
