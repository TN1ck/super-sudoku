import * as React from 'react';

import {connect} from 'react-redux';
import {SudokuState} from 'src/ducks/sudoku';
import {
  pauseGame,
  continueGame,
  resetGame,
  newGame,
  GameState,
} from 'src/ducks/game';

import {Cell} from 'src/ducks/sudoku/model';
import {SudokuComponentNewConnected} from 'src/components/modules/Sudoku';

import GameTimer from './GameTimer';
import GameMenu from './GameMenu';

import { Container } from 'src/components/modules/Layout';
import Button from 'src/components/modules/Button';
import styled from 'styled-components';
import THEME from 'src/theme';

const Sudoku: React.StatelessComponent<{
  grid: Cell[];
}> = ({grid}) => {
  return (
    <SudokuComponentNewConnected sudoku={grid} />
  );
};

const ConnectedSudoku = connect(
  function(state) {
    return {
      sudoku: state.sudoku as SudokuState,
      grid: (state.sudoku as SudokuState).grid,
    };
  },
  function() {
    return {};
  },
)(Sudoku);

function PauseButton({pauseGame}) {
  return (
    <Button
      onClick={pauseGame}
      style={{
        float: 'right',
        marginBottom: THEME.spacer.x2,
      }}
    >
      {'Pause'}
    </Button>
  );
}

const GameContainer = styled.div`
  color: white;
  margin: auto;
  width: 550px;
  position: relative;
  margin-top: ${THEME.spacer.x3}px;
  margin-bottom: ${THEME.spacer.x3 + 20}px;

  @media (max-width: 600px) {
      width: calc(100vw - 2rem);
  }

  @media (min-width: 601px) and (max-width: 800px) {
      width: 450px;
  }
`;


const GridContainer = styled.div`
  color: black;
  box-shadow: ${THEME.boxShadow};
  background-color: white;
  width: 550px;
  height: 550px;
  flex-wrap: wrap;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;

  @media (max-width: 600px) {
      width: calc(100vw - 2rem);
      height: calc(100vw - 2rem);
  }

  @media (min-width: 601px) and (max-width: 800px) {
      width: 450px;
      height: 450px;
  }
`;


class Game extends React.Component<
  {
    game: GameState;
    continueGame: typeof continueGame;
    resetGame: typeof resetGame;
    pauseGame: typeof pauseGame;
    newGame: typeof newGame;
  },
  {}
> {
  render() {
    const {game, pauseGame} = this.props;
    return (
      <Container>
        <GameContainer>
          <GameMenu />
          <GameTimer
            startTime={game.startTime}
            stopTime={game.stopTime}
            offsetTime={game.offsetTime}
          />
          <PauseButton pauseGame={pauseGame} />
          <GridContainer>
            <ConnectedSudoku />
          </GridContainer>
        </GameContainer>
      </Container>
    );
  }
}

export default connect(
  function(state) {
    return {
      game: state.game,
    };
  },
  {
    continueGame,
    pauseGame,
    resetGame,
  },
)(Game);
