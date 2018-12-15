import * as React from "react";

import {connect} from "react-redux";
import {
  pauseGame,
  continueGame,
  resetGame,
  newGame,
  GameState,
  wonGame,
  hideMenu,
  showMenu,
  selectCell,
  GameStateMachine,
} from "src/ducks/game";

import {Sudoku} from "src/components/modules/Sudoku/Sudoku";

import GameTimer from "./GameTimer";
import GameMenu from "./GameMenu";

import {Container} from "src/components/modules/Layout";
import Button from "src/components/modules/Button";
import styled from "styled-components";
import THEME from "src/theme";
import {RootState} from "src/ducks";
import SudokuState from "src/ducks/sudoku/accessor";
import {Cell} from "src/ducks/sudoku/model";
import {emptyGrid, setNumber, clearNumber, setSudoku} from "src/ducks/sudoku";
import key from "keymaster";
import {SUDOKU_NUMBERS, SUDOKU_COORDINATES, DIFFICULTY} from "src/engine/utility";
import {nextSudoku, previousSudoku} from "src/ducks/game/choose";
import sudokus from "src/sudokus";
import SudokuMenuNumbers from "src/components/modules/Sudoku/SudokuMenuNumbers";
import SudokuMenuControls from "src/components/modules/Sudoku/SudokuMenuControls";

function PauseButton({pauseGame}) {
  return (
    <Button
      onClick={pauseGame}
      style={{
        float: "right",
        marginBottom: THEME.spacer.x2,
      }}
    >
      {"Pause"}
    </Button>
  );
}

const MAX_WIDTH = 550;

const GameContainer = styled.div`
  display: grid;
  justify-content: center;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "game-header"
    "game-main"
    "game-footer";

  color: white;
  position: relative;
  margin-top: ${THEME.spacer.x3}px;
  margin-bottom: ${THEME.spacer.x3 + 20}px;
  margin-left: auto;
  margin-right: auto;
  max-width: ${MAX_WIDTH}px;

  @media (max-width: 600px) {
    max-width: auto;
    margin-left: ${-THEME.spacer.x2 + THEME.spacer.x4}px;
    margin-right: ${-THEME.spacer.x2 + THEME.spacer.x4}px;
  }
`;

const GameMainArea = styled.div`
  grid-area: game-main;
  position: relative;
  color: black;
  box-shadow: ${THEME.boxShadow};
  background-color: white;
  border-radius: ${THEME.borderRadius}px;
  width: ${MAX_WIDTH}px;
  height: ${MAX_WIDTH}px;
  flex-wrap: wrap;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;

  @media (max-width: 600px) {
    width: calc(100vw - ${THEME.spacer.x5}px);
    height: calc(100vw - ${THEME.spacer.x5}px);
  }
`;

const GameHeaderArea = styled.div`
  grid-area: game-header;
`;

const GameFooterArea = styled.div`
  grid-area: game-footer;
`;

interface GameDispatchProps {
  continueGame: typeof continueGame;
  resetGame: typeof resetGame;
  pauseGame: typeof pauseGame;
  newGame: typeof newGame;
  wonGame: typeof wonGame;
  showMenu: typeof showMenu;
  hideMenu: typeof hideMenu;
  selectCell: typeof selectCell;
}

interface GameStateProps {
  game: GameState;
  sudoku: Cell[];
}

enum ShortcutScope {
  Game = "Game",
  Menu = "Menu",
  SelectSudoku = "SelectSudoku",
}

interface GameMenuShortcutsDispatchProps {
  continueGame: typeof continueGame;
}

// TODO
class GameMenuShortcuts extends React.Component<GameMenuShortcutsDispatchProps> {
  componentDidMount() {
    key("esc", ShortcutScope.Menu, () => {
      this.props.continueGame();
      return false;
    });
    key("up", ShortcutScope.Menu, () => {
      console.log("up");
      return false;
    });
    key("down", ShortcutScope.Menu, () => {
      console.log("down");
      return false;
    });
    key("enter", ShortcutScope.Menu, () => {
      console.log("enter");
      return false;
    });
  }
  componentWillUnmount() {
    key.deleteScope(ShortcutScope.Menu);
  }
  render() {
    return null;
  }
}

const ConnectedGameMenuShortcuts = connect<{}, GameMenuShortcutsDispatchProps>(
  null,
  {continueGame},
)(GameMenuShortcuts);

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
}

interface GameSelectShortcutsDispatchProps {
  setSudoku: typeof setSudoku;
  nextSudoku: typeof nextSudoku;
  previousSudoku: typeof previousSudoku;
  continueGame: typeof continueGame;
}

interface GameSelectShortcutsStateProps {
  sudokuIndex: number;
  difficulty: DIFFICULTY;
}

class GameSelectShortcuts extends React.Component<GameSelectShortcutsDispatchProps & GameSelectShortcutsStateProps> {
  componentWillMount() {
    key("up", ShortcutScope.SelectSudoku, () => {
      console.log("up");
      return false;
    });
    key("down", ShortcutScope.SelectSudoku, () => {
      console.log("down");
      return false;
    });
    key("left", ShortcutScope.SelectSudoku, () => {
      this.props.previousSudoku();
      return false;
    });
    key("right", ShortcutScope.SelectSudoku, () => {
      this.props.nextSudoku();
      return false;
    });
    key("enter", ShortcutScope.SelectSudoku, () => {
      const sudoku = sudokus[this.props.difficulty][this.props.sudokuIndex];
      this.props.setSudoku(this.props.difficulty, sudoku.value);
      this.props.continueGame();
    });
  }
  componentWillUnmount() {
    key.deleteScope(ShortcutScope.SelectSudoku);
  }
  render() {
    return null;
  }
}

const ConnectedGameSelectShortcuts = connect<GameSelectShortcutsStateProps, GameSelectShortcutsDispatchProps>(
  (state: RootState) => ({
    sudokuIndex: state.choose.sudokuIndex,
    difficulty: state.choose.difficulty,
  }),
  {previousSudoku, nextSudoku, setSudoku, continueGame},
)(GameSelectShortcuts);

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
        this.props.setNumber(this.props.activeCell, n);
      });
    });

    key("backspace", ShortcutScope.Game, () => {
      this.props.clearNumber(this.props.activeCell);
    });
  }

  componentWillUnmount() {
    key.deleteScope(ShortcutScope.Game);
  }
  render() {
    return null;
  }
}

const ConnectedGameKeyboardShortcuts = connect<GameKeyboardShortcutsStateProps, GameKeyboardShortcutsDispatchProps>(
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
  },
)(GameKeyboardShortcuts);

type GameProps = GameStateProps & GameDispatchProps;

class Game extends React.Component<GameProps> {
  componentDidUpdate(prevProps: GameProps) {
    const state = new SudokuState();
    // check if won
    const wasSolved = state.isSolved(prevProps.sudoku);
    const isSolved = state.isSolved(this.props.sudoku);
    if (isSolved && !wasSolved) {
      this.props.wonGame();
    }
    this.selectShortcutState();
  }

  componentWillMount() {
    this.selectShortcutState();
  }

  selectShortcutState() {
    if (this.props.game.state === GameStateMachine.paused) {
      key.setScope(ShortcutScope.Menu);
    }
    if (this.props.game.state === GameStateMachine.running) {
      key.setScope(ShortcutScope.Game);
    }
    if (this.props.game.state === GameStateMachine.chooseGame) {
      key.setScope(ShortcutScope.SelectSudoku);
    }
  }

  render() {
    const {game, pauseGame} = this.props;
    return (
      <Container>
        <ConnectedGameKeyboardShortcuts />
        <ConnectedGameMenuShortcuts />
        <ConnectedGameSelectShortcuts />
        <GameContainer>
          <GameHeaderArea>
            <GameMenu />
            <GameTimer startTime={game.startTime} stopTime={game.stopTime} offsetTime={game.offsetTime} />
            <PauseButton pauseGame={pauseGame} />
          </GameHeaderArea>
          <GameMainArea>
            <Sudoku
              notesMode={this.props.game.notesMode}
              shouldShowMenu={this.props.game.showMenu}
              sudoku={this.props.sudoku}
              showMenu={this.props.showMenu}
              hideMenu={this.props.hideMenu}
              selectCell={this.props.selectCell}
              showHints={game.showHints && game.state === GameStateMachine.running}
              activeCell={game.activeCell}
            />
          </GameMainArea>
          <GameFooterArea>
            <SudokuMenuNumbers />
            <SudokuMenuControls />
          </GameFooterArea>
        </GameContainer>
      </Container>
    );
  }
}

export default connect(
  (state: RootState) => {
    const sudoku = state.game.state === GameStateMachine.running ? state.sudoku : emptyGrid;
    return {
      game: state.game,
      sudoku,
    };
  },
  {
    continueGame,
    pauseGame,
    resetGame,
    wonGame,
    showMenu,
    selectCell,
    hideMenu,
  },
)(Game);
