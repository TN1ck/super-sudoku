import * as React from "react";
import {navigate} from "@reach/router";

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
} from "src/ducks/game";

import {Sudoku} from "src/components/modules/Sudoku/Sudoku";

import GameTimer from "./GameTimer";
import GameMenu from "./GameMenu";

// import {Container} from "src/components/modules/Layout";
import Button from "src/components/modules/Button";
import styled from "styled-components";
import THEME from "src/theme";
import {RootState} from "src/ducks";
import SudokuState from "src/ducks/sudoku/accessor";
import {emptyGrid} from "src/ducks/sudoku";
import {DIFFICULTY, Cell} from "src/engine/utility";
import SudokuMenuNumbers from "src/components/modules/Sudoku/SudokuMenuNumbers";
import SudokuMenuControls from "src/components/modules/Sudoku/SudokuMenuControls";
import { Container } from "src/components/modules/Layout";
// import Shortcuts from "./shortcuts/Shortcuts";

function PauseButton({running, pauseGame, continueGame}) {
  return (
    <Button
      onClick={running ? pauseGame : continueGame}
      style={{
        float: "right",
        marginLeft: THEME.spacer.x2,
        marginBottom: THEME.spacer.x2,
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
        marginLeft: THEME.spacer.x2,
        marginBottom: THEME.spacer.x2,
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
  padding-top: ${THEME.spacer.x3}px;
  padding-bottom: ${THEME.spacer.x3 + 20}px;

  grid-column-gap: ${THEME.spacer.x3}px;

  @media (max-width: 800px) {
    grid-template-areas:
      "game-header"
      "game-main"
      "game-controls";
    max-width: ${THEME.widths.maxMobile - THEME.spacer.paddingMobile * 2}px;
    grid-column-gap: 0;
    padding: 0;
  }

  @media (max-width: ${THEME.widths.maxMobile}px) {
    max-width: 100%;
  }
`;

const GameContainer = styled.div`
  min-height: 100%;
  background: black;
`;

const GameMainArea = styled.div`
  grid-area: game-main;
  position: relative;
  color: black;
  box-shadow: ${THEME.boxShadow};
  background-color: white;
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
`;

const GameHeaderLeftSide = styled.div`
  display: flex;
`;

const GameHeaderRightSide = styled.div`
`;

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
}

interface GameStateProps {
  game: GameState;
  sudoku: Cell[];
  difficulty: DIFFICULTY;
}

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
  }

  render() {
    const {difficulty, game, pauseGame, continueGame} = this.props;
    const chooseAnotherGame = () => {
      navigate("/new");
    };
    return (
      <div style={{height: "100%"}}>
        <Container>
          <h1>Sudoku </h1>
        </Container>
      <GameContainer>
        <Container>
          <GameGrid>
            {/* <Shortcuts gameState={game.state} /> */}
            <GameMenu />
              <GameHeaderArea>
                <GameHeaderLeftSide>
                  <DifficultyShow>{difficulty}</DifficultyShow>
                  <div style={{width: THEME.spacer.x2}} />{"|"}<div style={{width: THEME.spacer.x2}} />
                  <GameTimer startTime={game.startTime} stopTime={game.stopTime} offsetTime={game.offsetTime} />
                </GameHeaderLeftSide>
                <GameHeaderRightSide>
                  <PauseButton
                    continueGame={continueGame}
                    pauseGame={pauseGame}
                    running={game.state === GameStateMachine.running}
                  />
                  <NewGameButton newGame={chooseAnotherGame} />
                </GameHeaderRightSide>
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
  },
)(Game);
