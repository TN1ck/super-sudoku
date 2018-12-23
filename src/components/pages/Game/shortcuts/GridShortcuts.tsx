import * as React from "react";
import key from "keymaster";
import {Cell, SUDOKU_COORDINATES, SUDOKU_NUMBERS} from "src/engine/utility";
import {showMenu, hideMenu, selectCell, pauseGame} from "src/ducks/game";
import {setNumber, clearNumber, getHint} from "src/ducks/sudoku";
import {ShortcutScope} from "./scopes";
import {connect} from "react-redux";
import {RootState} from "src/ducks";

interface GameKeyboardShortcutsStateProps {
  activeCell: Cell;
  sudoku: Cell[];
}

interface GameKeyboardShortcutsDispatchProps {
  showMenu: typeof showMenu;
  hideMenu: typeof hideMenu;
  selectCell: typeof selectCell;
  setNumber: typeof setNumber;
  clearNumber: typeof clearNumber;
  pauseGame: typeof pauseGame;
  getHint: typeof getHint;
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
          this.props.setNumber(this.props.activeCell, n);
        }
      });
    });

    key("backspace", ShortcutScope.Game, () => {
      if (!this.props.activeCell.initial) {
        this.props.clearNumber(this.props.activeCell);
      }
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
  (state: RootState) => ({
    sudoku: state.sudoku,
    activeCell: state.game.activeCell,
  }),
  {
    setNumber,
    clearNumber,
    selectCell,
    hideMenu,
    showMenu,
    pauseGame,
    getHint,
  },
)(GameKeyboardShortcuts);
