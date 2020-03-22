import * as React from "react";
import key from "keymaster";
import {SUDOKU_COORDINATES, SUDOKU_NUMBERS} from "src/engine/utility";
import {Cell} from "src/engine/types";
import {showMenu, hideMenu, selectCell, pauseGame, activateNotesMode, deactivateNotesMode} from "src/state/game";
import {setNumber, clearNumber, getHint, setNote, clearNote} from "src/state/sudoku";
import {ShortcutScope} from "./ShortcutScope";
import {connect} from "react-redux";
import {RootState} from "src/state/rootReducer";

interface GameKeyboardShortcutsStateProps {
  activeCell: Cell;
  sudoku: Cell[];
  notesMode: boolean;
}

interface GameKeyboardShortcutsDispatchProps {
  showMenu: typeof showMenu;
  hideMenu: typeof hideMenu;
  selectCell: typeof selectCell;
  setNumber: typeof setNumber;
  setNote: typeof setNote;
  clearNumber: typeof clearNumber;
  clearNote: typeof clearNote;
  pauseGame: typeof pauseGame;
  getHint: typeof getHint;
  activateNotesMode: typeof activateNotesMode;
  deactivateNotesMode: typeof deactivateNotesMode;
}

class GameKeyboardShortcuts extends React.Component<
  GameKeyboardShortcutsStateProps & GameKeyboardShortcutsDispatchProps
> {
  componentDidMount() {
    const getCellByXY = (x, y) => {
      return this.props.sudoku.find(cell => {
        return cell.x === x && cell.y === y;
      });
    };

    const setDefault = () => {
      this.props.selectCell(this.props.sudoku[0]);
    };

    const minCoordinate = SUDOKU_COORDINATES[0];
    const maxCoordinate = SUDOKU_COORDINATES[SUDOKU_COORDINATES.length - 1];

    key("escape", ShortcutScope.Game, () => {
      this.props.pauseGame();
      return false;
    });

    key("n", ShortcutScope.Game, () => {
      if (this.props.notesMode) {
        this.props.deactivateNotesMode();
      } else {
        this.props.activateNotesMode();
      }
      return false;
    });

    key("up", ShortcutScope.Game, () => {
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

    key("down", ShortcutScope.Game, () => {
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

    key("right", ShortcutScope.Game, () => {
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

    key("left", ShortcutScope.Game, () => {
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

    SUDOKU_NUMBERS.forEach(n => {
      key(String(n), ShortcutScope.Game, () => {
        if (!this.props.activeCell.initial) {
          if (this.props.notesMode) {
            if (this.props.activeCell.notes.includes(n)) {
              this.props.clearNote(this.props.activeCell, n);
            } else {
              this.props.setNote(this.props.activeCell, n);
            }
          } else {
            this.props.setNumber(this.props.activeCell, n);
          }
        }
      });
    });

    key("backspace", ShortcutScope.Game, () => {
      if (!this.props.activeCell.initial) {
        this.props.clearNumber(this.props.activeCell);
      }
      return false;
    });
    key("h", ShortcutScope.Game, () => {
      if (!this.props.activeCell.initial) {
        this.props.getHint(this.props.activeCell);
      }
    });
  }

  componentWillUnmount() {
    key.deleteScope(ShortcutScope.Game);
  }
  render() {
    return null;
  }
}

export default connect<GameKeyboardShortcutsStateProps, GameKeyboardShortcutsDispatchProps>(
  (state: RootState) => {
    const activeCell = state.game.activeCellCoordinates
      ? state.sudoku.find(s => {
          return s.x === state.game.activeCellCoordinates.x && s.y === state.game.activeCellCoordinates.y;
        })
      : null;
    return {
      sudoku: state.sudoku,
      activeCell,
      notesMode: state.game.notesMode,
    };
  },
  {
    setNumber,
    setNote,
    clearNumber,
    clearNote,
    selectCell,
    hideMenu,
    showMenu,
    pauseGame,
    getHint,
    deactivateNotesMode,
    activateNotesMode,
  },
)(GameKeyboardShortcuts);
