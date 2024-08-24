import * as React from "react";
import key from "keymaster";
import hotkeys from "hotkeys-js";
import {SUDOKU_COORDINATES, SUDOKU_NUMBERS} from "src/engine/utility";
import {Cell} from "src/engine/types";
import {showMenu, hideMenu, selectCell, pauseGame, activateNotesMode, deactivateNotesMode} from "src/state/game";
import {setNumber, clearNumber, getHint, setNotes, undo, redo} from "src/state/sudoku";
import {ShortcutScope} from "./ShortcutScope";
import {connect} from "react-redux";
import {RootState} from "src/state/rootReducer";
import SudokuGame from "src/sudoku-game/SudokuGame";

interface GameKeyboardShortcutsStateProps {
  // TODO: This can actually be null
  activeCell: Cell;
  sudoku: Cell[];
  notesMode: boolean;
  showHints: boolean;
}

interface GameKeyboardShortcutsDispatchProps {
  showMenu: typeof showMenu;
  hideMenu: typeof hideMenu;
  selectCell: typeof selectCell;
  setNumber: typeof setNumber;
  setNotes: typeof setNotes;
  clearNumber: typeof clearNumber;
  pauseGame: typeof pauseGame;
  getHint: typeof getHint;
  activateNotesMode: typeof activateNotesMode;
  deactivateNotesMode: typeof deactivateNotesMode;
  undo: typeof undo;
  redo: typeof redo;
}

class GameKeyboardShortcuts extends React.Component<
  GameKeyboardShortcutsStateProps & GameKeyboardShortcutsDispatchProps
> {
  componentDidMount() {
    const getCellByXY = (x: number, y: number) => {
      return this.props.sudoku.find((cell) => {
        return cell.x === x && cell.y === y;
      })!;
    };

    const setDefault = () => {
      this.props.selectCell(this.props.sudoku[0]);
    };

    const minCoordinate = SUDOKU_COORDINATES[0];
    const maxCoordinate = SUDOKU_COORDINATES[SUDOKU_COORDINATES.length - 1];

    hotkeys("escape", ShortcutScope.Game, () => {
      this.props.pauseGame();
      return false;
    });

    hotkeys("n", ShortcutScope.Game, () => {
      if (this.props.notesMode) {
        this.props.deactivateNotesMode();
      } else {
        this.props.activateNotesMode();
      }
      return false;
    });

    hotkeys("up", ShortcutScope.Game, () => {
      const currentCell = this.props.activeCell;
      if (currentCell === null) {
        return setDefault();
      }
      const {x, y} = currentCell;
      const newY = Math.max(y - 1, minCoordinate);
      const nextCell = getCellByXY(x, newY);
      this.props.selectCell(nextCell);
      return false;
    });

    hotkeys("down", ShortcutScope.Game, () => {
      const currentCell = this.props.activeCell;
      if (currentCell === null) {
        return setDefault();
      }
      const {x, y} = currentCell;
      const newY = Math.min(y + 1, maxCoordinate);
      const nextCell = getCellByXY(x, newY);
      this.props.selectCell(nextCell);
      return false;
    });

    hotkeys("right", ShortcutScope.Game, () => {
      const currentCell = this.props.activeCell;
      if (currentCell === null) {
        return setDefault();
      }
      const {x, y} = currentCell;
      const newX = Math.min(x + 1, maxCoordinate);
      const nextCell = getCellByXY(newX, y);
      this.props.selectCell(nextCell);
      return false;
    });

    hotkeys("left", ShortcutScope.Game, () => {
      const currentCell = this.props.activeCell;
      if (currentCell === null) {
        return setDefault();
      }
      const {x, y} = currentCell;
      const newX = Math.max(x - 1, minCoordinate);
      const nextCell = getCellByXY(newX, y);
      this.props.selectCell(nextCell);
      return false;
    });

    SUDOKU_NUMBERS.forEach((n) => {
      const keys = [String(n), `num_${n}`].join(",");
      hotkeys(keys, ShortcutScope.Game, () => {
        if (!this.props.activeCell.initial) {
          if (this.props.notesMode) {
            const conflicting = SudokuGame.conflictingFields(this.props.sudoku);
            const userNotes = this.props.activeCell.notes;
            const conflictingCell = conflicting[this.props.activeCell!.y * 9 + this.props.activeCell!.x];
            const autoNotes = this.props.showHints ? conflictingCell.possibilities : [];
            const notesToUse = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;

            const newNotes = notesToUse.includes(n) ? notesToUse.filter((note) => note !== n) : [...userNotes, n];
            this.props.setNotes(this.props.activeCell, newNotes);
          } else {
            this.props.setNumber(this.props.activeCell, n);
          }
        }
      });
    });

    hotkeys("backspace,num_subtract", ShortcutScope.Game, () => {
      if (!this.props.activeCell.initial) {
        this.props.clearNumber(this.props.activeCell);
      }
      return false;
    });
    hotkeys("h", ShortcutScope.Game, () => {
      if (!this.props.activeCell.initial) {
        this.props.getHint(this.props.activeCell);
      }
    });

    hotkeys("ctrl+z,cmd+z", ShortcutScope.Game, () => {
      this.props.undo();
      return false;
    });

    hotkeys("ctrl+y,cmd+y", ShortcutScope.Game, () => {
      this.props.redo();
      return false;
    });
  }

  componentWillUnmount() {
    hotkeys.deleteScope(ShortcutScope.Game);
  }
  render() {
    return null;
  }
}

export default connect<GameKeyboardShortcutsStateProps, GameKeyboardShortcutsDispatchProps, {}, RootState>(
  (state: RootState) => {
    const activeCell = state.game.activeCellCoordinates
      ? state.sudoku.current.find((s) => {
          return s.x === state.game.activeCellCoordinates?.x && s.y === state.game.activeCellCoordinates.y;
        })
      : null;
    return {
      sudoku: state.sudoku.current,
      activeCell: activeCell!,
      notesMode: state.game.notesMode,
      showHints: state.game.showHints,
    };
  },
  {
    setNumber,
    setNotes,
    clearNumber,
    selectCell,
    hideMenu,
    showMenu,
    pauseGame,
    getHint,
    deactivateNotesMode,
    activateNotesMode,
    undo,
    redo,
  },
)(GameKeyboardShortcuts);
