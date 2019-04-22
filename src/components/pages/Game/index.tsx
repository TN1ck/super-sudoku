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
  chooseGame,
  toggleShowHints,
  activateNotesMode,
  activateSettings,
  deactivateNotesMode,
  toggleShowCircleMenu,
} from "src/ducks/game";

import {setNumber, setNote, clearCell, getHint} from "src/ducks/sudoku";

import {Sudoku} from "src/components/pages/Game/Sudoku/Sudoku";

import GameTimer from "./GameTimer";
import GameMenu from "./GameMenu";

import Button from "src/components/modules/Button";
import styled from "styled-components";
import THEME from "src/theme";
import {RootState} from "src/ducks";
import SudokuGame from "src/engine/game";
import {emptyGrid} from "src/ducks/sudoku";
import {DIFFICULTY, Cell} from "src/engine/utility";
import SudokuMenuNumbers, {
  SudokuMenuNumbersStateProps,
  SudokuMenuNumbersDispatchProps,
} from "src/components/pages/Game/GameControls/GameControlNumbers";
import SudokuMenuControls, {
  SudokuMenuControlsStateProps,
  SudokuMenuControlsDispatchProps,
} from "src/components/pages/Game/GameControls/GameControlActions";
import {Container} from "src/components/modules/Layout";
import Shortcuts from "./shortcuts/Shortcuts";
import Checkbox from "src/components/modules/Checkbox";

const SudokuMenuControlsConnected = connect<SudokuMenuControlsStateProps, SudokuMenuControlsDispatchProps>(
  (state: RootState) => ({
    notesMode: state.game.notesMode,
    activeCell: state.game.activeCellCoordinates,
  }),
  {
    clearCell,
    deactivateNotesMode,
    activateNotesMode,
    activateSettings,
    getHint,
  },
)(SudokuMenuControls);

const SudokuMenuNumbersConnected = connect<SudokuMenuNumbersStateProps, SudokuMenuNumbersDispatchProps>(
  (state: RootState) => ({
    notesMode: false,
    activeCell: state.game.activeCellCoordinates,
  }),
  {
    setNumber,
    setNote,
  },
)(SudokuMenuNumbers);

function PauseButton({running, pauseGame, continueGame}) {
  return (
    <Button
      onClick={running ? pauseGame : continueGame}
      style={{
        float: "right",
        marginLeft: THEME.spacer.x1,
      }}
    >
      {running ? "Pause" : "Continue"}
    </Button>
  );
}

function NewGameButton({newGame}) {
  return (
    <Button
      onClick={newGame}
      style={{
        float: "right",
        marginLeft: THEME.spacer.x1,
      }}
    >
      {"New"}
    </Button>
  );
}

const DifficultyShow = styled.div`
  color: white;
  text-transform: capitalize;
  font-size: ${THEME.fontSize.menu}px;
`;

const GameGrid = styled.div`
  justify-content: center;

  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;

  grid-template-areas:
    "game-header game-header"
    "game-main game-controls"
    "game-main game-controls";

  color: white;
  position: relative;
  padding-bottom: ${THEME.spacer.x3 + 20}px;

  grid-column-gap: ${THEME.spacer.x3}px;

  margin: 0 auto;

  @media (max-width: 800px) {
    grid-template-areas:
      "game-header"
      "game-main"
      "game-controls";
    max-width: ${THEME.widths.maxMobile - THEME.spacer.paddingMobile * 2}px;
    grid-template-columns: 1fr;
    grid-column-gap: 0;
    padding-bottom: 0;
  }

  @media (max-width: ${THEME.widths.maxMobile}px) {
  }
`;

const GameContainer = styled.div`
  max-width: 100%;
  min-height: 100%;
  position: relative;
`;

const GameMainArea = styled.div`
  grid-area: game-main;
  position: relative;
  box-shadow: ${THEME.boxShadow};
  border-radius: ${THEME.borderRadius}px;
  width: ${THEME.widths.maxMobile}px;
  height: ${THEME.widths.maxMobile}px;
  flex-wrap: wrap;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;

  @media (min-width: 800px) and (max-width: 900px) {
    width: 400px;
    height: 400px;
  }

  @media (min-width: 900px) and (max-width: 1000px) {
    width: 500px;
    height: 500px;
  }

  @media (max-width: ${THEME.widths.maxMobile}px) {
    /* As we need a value for the height, we need to make it it 100vw */
    width: calc(100vw - ${THEME.spacer.paddingMobile * 2}px);
    height: calc(100vw - ${THEME.spacer.paddingMobile * 2}px);
  }
`;

const GameHeaderArea = styled.div`
  grid-area: game-header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${THEME.spacer.x2}px 0;
`;

const GameHeaderLeftSide = styled.div`
  display: flex;
`;

const GameHeaderRightSide = styled.div``;

const GameFooterArea = styled.div`
  grid-area: game-controls;
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
  chooseGame: typeof chooseGame;
  toggleShowHints: typeof toggleShowHints;
  toggleShowCircleMenu: typeof toggleShowCircleMenu;
}

interface GameStateProps {
  game: GameState;
  sudoku: Cell[];
  difficulty: DIFFICULTY;
}

type GameProps = GameStateProps & GameDispatchProps;

class Game extends React.Component<GameProps> {
  componentDidUpdate(prevProps: GameProps) {
    // check if won
    const wasSolved = SudokuGame.isSolved(prevProps.sudoku);
    const isSolved = SudokuGame.isSolved(this.props.sudoku);
    if (isSolved && !wasSolved) {
      this.props.wonGame();
    }
  }

  componentDidMount() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibilityChange, false);
    }
  }

  componentWillUnmount() {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibilityChange, false);
    }
  }

  onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      this.props.pauseGame();
    } else {
      this.props.continueGame();
    }
  };

  render() {
    const {difficulty, game, pauseGame, continueGame, chooseGame, sudoku} = this.props;
    const activeCell = game.activeCellCoordinates
      ? sudoku.find(s => {
          return s.x === game.activeCellCoordinates.x && s.y === game.activeCellCoordinates.y;
        })
      : null;
    return (
      <div style={{height: "100%"}}>
        <GameContainer>
          <GameMenu />
          <Container>
            <GameGrid>
              <Shortcuts gameState={game.state} />
              <GameHeaderArea>
                <GameHeaderLeftSide>
                  <DifficultyShow>{difficulty}</DifficultyShow>
                  <div style={{width: THEME.spacer.x2}} />
                  {"|"}
                  <div style={{width: THEME.spacer.x2}} />
                  <GameTimer startTime={game.startTime} stopTime={game.stopTime} offsetTime={game.offsetTime} />
                </GameHeaderLeftSide>
                <GameHeaderRightSide>
                  <PauseButton
                    continueGame={continueGame}
                    pauseGame={pauseGame}
                    running={game.state === GameStateMachine.running}
                  />
                  <NewGameButton newGame={chooseGame} />
                </GameHeaderRightSide>
              </GameHeaderArea>
              <GameMainArea>
                <Sudoku
                  notesMode={this.props.game.notesMode || this.props.game.showNotes}
                  shouldShowMenu={this.props.game.showMenu && this.props.game.showCircleMenu}
                  sudoku={this.props.sudoku}
                  showMenu={this.props.showMenu}
                  hideMenu={this.props.hideMenu}
                  selectCell={this.props.selectCell}
                  showHints={game.showHints && game.state === GameStateMachine.running}
                  activeCell={activeCell}
                />
              </GameMainArea>
              <GameFooterArea>
                <SudokuMenuNumbersConnected />
                <SudokuMenuControlsConnected />
                <h1>Settings</h1>
                <Checkbox id="generated_notes" checked={game.showHints} onChange={this.props.toggleShowHints}>
                  {"Show auto generated notes"}
                </Checkbox>
                <Checkbox id="circle_menu" checked={game.showCircleMenu} onChange={this.props.toggleShowCircleMenu}>
                  {"Show circle menu when a cell is selected"}
                </Checkbox>
              </GameFooterArea>
            </GameGrid>
          </Container>
        </GameContainer>
      </div>
    );
  }
}

export default connect(
  (state: RootState) => {
    const sudoku = state.game.state === GameStateMachine.running ? state.sudoku : emptyGrid;
    return {
      game: state.game,
      sudoku,
      difficulty: state.choose.difficulty,
    };
  },
  {
    continueGame,
    pauseGame,
    resetGame,
    chooseGame,
    wonGame,
    showMenu,
    selectCell,
    hideMenu,
    toggleShowHints,
    toggleShowCircleMenu,
  },
)(Game);
