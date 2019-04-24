import SUDOKUS from "src/sudoku-game/sudokus";
import {GameState} from "src/state/game";
import {SudokuState} from "src/state/sudoku";

const STORAGE_KEY = "super_sudoku_1_0_use_this_file_if_you_want_to_cheat";

interface StoredState {
  active: number;
  sudokus: {
    [key: number]: {game: GameState; sudoku: SudokuState};
  };
}

const loadFromLocalStorage = (): StoredState => {
  const empty = {
    active: -1,
    sudokus: {},
  };
  if (typeof localStorage === "undefined") {
    return empty;
  }
  const text = localStorage.getItem(STORAGE_KEY);
  if (text !== null) {
    try {
      return JSON.parse(text);
    } catch {
      // delete entry but save it as corrupted, so one might be able to restore it
      console.error("File corrupted: will delete and save as corrupted.");
      localStorage.setItem(STORAGE_KEY + "_corrupted_" + new Date().toISOString, text);
      localStorage.removeItem(STORAGE_KEY);
      return empty;
    }
  }
  return empty;
};

let cached: StoredState = loadFromLocalStorage();

export const saveToLocalStorage = (game: GameState, sudoku: SudokuState) => {
  cached.active = game.sudokuId;
  cached.sudokus[game.sudokuId] = {game, sudoku};
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    console.error("LocalStorage is not supported! No Saving possible.");
  }
};

export const getState = () => {
  return cached;
};

export default SUDOKUS;
