import SUDOKUS from "src/sudoku-game/sudokus";
import {GameState, GameStateMachine} from "src/state/game";
import {SudokuState} from "src/state/sudoku";

const STORAGE_KEY = "super_sudoku_1_0_use_this_file_if_you_want_to_cheat";
const STORAGE_KEY_STOP_TIME = "super_sudoku_1_0_use_this_file_if_you_want_to_cheat_stop_time";

interface StoredState {
  active: number;
  sudokus: {
    [key: number]: {game: GameState; sudoku: SudokuState};
  };
}

export const saveStopTimeToLocalStorage = (date: Date) => {
  localStorage.setItem(STORAGE_KEY_STOP_TIME, JSON.stringify(date.getTime()));
};

const loadStopTimeFromLocalStorage = (): Date | undefined => {
  const unixTime = Number.parseInt(localStorage.getItem(STORAGE_KEY_STOP_TIME));
  return isNaN(unixTime) ? undefined : new Date(unixTime);
};

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
      const result = JSON.parse(text) as StoredState;
      if (result.active !== -1) {
        const activeSudoku = result.sudokus[result.active];
        // load the last time the user had the app running
        const stopTime = loadStopTimeFromLocalStorage();
        if (stopTime && ![GameStateMachine.paused, GameStateMachine.wonGame].includes(activeSudoku.game.state)) {
          activeSudoku.game.stopTime = stopTime.getTime();
          activeSudoku.game.state = GameStateMachine.paused;
        }
      }
      return result;
    } catch (e) {
      // delete entry but save it as corrupted, so one might be able to restore it
      console.error("File corrupted: will delete and save as corrupted.");
      localStorage.setItem(STORAGE_KEY + "_corrupted_" + new Date().toISOString(), text);
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
