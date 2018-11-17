import * as React from "react";

import {connect} from "react-redux";
import {pauseGame, continueGame, resetGame, newGame, GameState, wonGame} from "src/ducks/game";

import {SudokuConnected} from "src/components/modules/Sudoku/Sudoku";

import GameTimer from "./GameTimer";
import GameMenu from "./GameMenu";

import {Container} from "src/components/modules/Layout";
import Button from "src/components/modules/Button";
import styled from "styled-components";
import THEME from "src/theme";
import {RootState} from "src/ducks";
import SudokuState from "src/ducks/sudoku/accessor";
import {Cell} from "src/ducks/sudoku/model";

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
  display: flex;
  justify-content: center;

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

const GridContainer = styled.div`
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

class Game extends React.Component<{
  game: GameState;
  sudoku: Cell[];
  continueGame: typeof continueGame;
  resetGame: typeof resetGame;
  pauseGame: typeof pauseGame;
  newGame: typeof newGame;
  wonGame: typeof wonGame;
}> {
  componentWillReceiveProps(props) {
    const state = new SudokuState();
    const wasSolved = state.isSolved(this.props.sudoku);
    const isSolved = state.isSolved(props.sudoku);
    console.log("was", wasSolved, "is", isSolved);
    if (isSolved && !wasSolved) {
      this.props.wonGame();
    }
  }

  render() {
    const {game, pauseGame} = this.props;
    return (
      <Container>
        <GameContainer>
          <div>
            <div>
              <GameMenu />
              <GameTimer startTime={game.startTime} stopTime={game.stopTime} offsetTime={game.offsetTime} />
              <PauseButton pauseGame={pauseGame} />
            </div>
            <GridContainer>
              <SudokuConnected />
            </GridContainer>
          </div>
        </GameContainer>
      </Container>
    );
  }
}

export default connect(
  (state: RootState) => {
    return {
      game: state.game,
      sudoku: state.sudoku.grid,
    };
  },
  {
    continueGame,
    pauseGame,
    resetGame,
    wonGame,
  },
)(Game);
