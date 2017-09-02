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
import {GridComponent} from 'src/components/modules/Sudoku';
import {Section} from 'src/components/modules/Layout';

import GameTimer from './GameTimer';
import GameMenu from './GameMenu';

import * as Grid from 'src/components/modules/Grid';
import './styles.scss';

const Sudoku: React.StatelessComponent<{
  grid: Cell[];
}> = function _Sudoku(props) {
  return (
    <GridComponent grid={props.grid} />
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
    <div onClick={pauseGame} className={'ss_pause-button'}>
      {'Pause'}
    </div>
  );
}

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
      <Section paddingBottom={4} paddingTop={4}>
        <Grid.Grid>
          <Grid.Row>
            <Grid.Col md={4} xs={12}>
              <h1 className="ss_header ss_header--margin">
                {`Sudoku ${game.currentlySelectedDifficulty || ''}`}
              </h1>
            </Grid.Col>
            <Grid.Col md={8} xs={12}>
              <div className={'ss_game-container'}>
                <GameMenu />
                <GameTimer
                  startTime={game.startTime}
                  stopTime={game.stopTime}
                  offsetTime={game.offsetTime}
                />
                <PauseButton pauseGame={pauseGame} />
                <ConnectedSudoku />
              </div>
            </Grid.Col>
          </Grid.Row>
        </Grid.Grid>
      </Section>
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
