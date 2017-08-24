import * as React from 'react';

import {connect} from 'react-redux';
import {SudokuState, setSudoku} from 'src/ducks/sudoku';
import {
  pauseGame,
  continueGame,
  resetGame,
  newGame,
  GameState,
  getTime,
} from 'src/ducks/game';
import {DIFFICULTY} from 'src/engine/utility';

import {Cell, parseSudoku} from 'src/ducks/sudoku/model';
import {GridComponent, SmallSudokuComponent} from 'src/components/Sudoku';

import SUDOKUS from 'src/sudokus';

import * as Grid from 'src/components/Grid';
import './styles.scss';

const Sudoku: React.StatelessComponent<{
  grid: Cell[];
}> = function _Sudoku(props) {
  return (
    <div className={'ss_sudoku-container'}>
      <GridComponent grid={props.grid} />
    </div>
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

class GameTimer extends React.Component<{
  startTime: number;
  offsetTime: number;
  stopTime: number;
}> {
  _isMounted: boolean = false;
  componentDidMount() {
    this._isMounted = true;
    const timer = () => {
      requestAnimationFrame(() => {
        this.forceUpdate();
        if (this._isMounted) {
          timer();
        }
      });
    };
    timer();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    const {startTime, offsetTime, stopTime} = this.props;
    const milliseconds = getTime(startTime, offsetTime, stopTime);
    const seconds = Math.round(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const secondRest = seconds % 60;

    const minuteString: string = minutes < 10 ? '0' + minutes : String(minutes);
    const secondString: string =
      secondRest < 10 ? '0' + secondRest : String(secondRest);

    const timerString = minuteString + ':' + secondString;

    return (
      <span>
        {timerString}
      </span>
    );
  }
}

function PauseButton({pauseGame}) {
  return (
    <div onClick={pauseGame} className={'ss_pause-button'}>
      {'Pause'}
    </div>
  );
}

function GameMenuItem(props) {
  return (
    <li className={'ss_game-menu-list-item'} onClick={props.onClick}>
      {props.children}
    </li>
  );
}

const parseListOfSudokus = (sudokus: Array<{value: string, id: number}>) => {
  return sudokus.map(({value, id}) => {
    return {sudoku: parseSudoku(value), id, value};
  });
};

const PARSED_SUDOKUS = {
 [DIFFICULTY.EASY]: parseListOfSudokus(SUDOKUS[DIFFICULTY.EASY]),
 [DIFFICULTY.MEDIUM]: parseListOfSudokus(SUDOKUS[DIFFICULTY.MEDIUM]),
 [DIFFICULTY.HARD]: parseListOfSudokus(SUDOKUS[DIFFICULTY.HARD]),
 [DIFFICULTY.EVIL]: parseListOfSudokus(SUDOKUS[DIFFICULTY.EVIL]),
};

const SelectSudoku: React.StatelessComponent<{
  newGame: any;
  difficulty: DIFFICULTY;
}> = function({newGame, difficulty}) {
  const sudokus = PARSED_SUDOKUS[difficulty];
  const items = sudokus.map(({sudoku, id, value}) => {
    const onClick = () => newGame(id, value);
    return (
      <SmallSudokuComponent
        key={id}
        id={id}
        onClick={onClick}
        sudoku={sudoku}
      />
    );
  });
  return (
    <div className={'ss_sudoku-menu'} key="el">
      <div className={'ss_sudoku-menu-list'}>
        {items}
      </div>
    </div>
  );
};

const GameMenu = connect(
  function(state) {
    return {
      running: state.game.running,
      hasGame: state.game.currentlySelectedSudokuId !== undefined,
    };
  },
  function(dispatch) {
    return {
      continueGame: () => dispatch(continueGame()),
      resetGame: () => dispatch(resetGame()),
      newGame: (difficulty, sudokuId) =>
        dispatch(newGame(difficulty, sudokuId)),
      setSudoku: (difficulty, sudoku) =>
        dispatch(setSudoku(difficulty, sudoku)),
    };
  },
)(
  class GameMenu extends React.Component<
    {
      continueGame: () => any;
      resetGame: () => any;
      newGame: (difficulty, sudokuId) => any;
      setSudoku: (difficulty, sudoku) => any;
      running: boolean;
      hasGame: boolean;
    },
    {
      menuState: string;
      difficulty: DIFFICULTY;
    }
  > {
    constructor(props) {
      super(props);
      this.state = {
        menuState: 'INITIAL',
        difficulty: undefined,
      };
      this.chooseDifficulty = this.chooseDifficulty.bind(this);
      this.setDifficulty = this.setDifficulty.bind(this);
      this.newGame = this.newGame.bind(this);
    }
    chooseDifficulty() {
      this.setState({
        menuState: 'SET_DIFFICULTY',
      });
    }
    setDifficulty(difficulty) {
      this.setState({
        difficulty,
        menuState: 'CHOOSE_GAME',
      });
    }
    newGame(sudokuId, sudoku) {
      this.props.setSudoku(this.state.difficulty, sudoku);
      this.props.newGame(this.state.difficulty, sudokuId);
      this.props.continueGame();
      this.setState({
        menuState: 'INITIAL',
      });
    }
    render() {
      const {continueGame, resetGame, running, hasGame} = this.props;

      let items = [];

      if (this.state.menuState === 'INITIAL') {
        if (hasGame) {
          items.push(
            <GameMenuItem onClick={continueGame} key="continue">
              {'Continue'}
            </GameMenuItem>,
          );
          items.push(
            <GameMenuItem onClick={resetGame} key="reset-game">
              {'Reset Game'}
            </GameMenuItem>,
          );
        } else {
          items.push(
            <GameMenuItem key="new-game" onClick={this.chooseDifficulty}>
              {'New Game'}
            </GameMenuItem>,
          );
        }
      }

      if (this.state.menuState === 'SET_DIFFICULTY') {
        const difficulties = [
          {
            label: 'Easy',
            difficulty: DIFFICULTY.EASY,
          },
          {
            label: 'Medium',
            difficulty: DIFFICULTY.MEDIUM,
          },
          {
            label: 'Hard',
            difficulty: DIFFICULTY.HARD,
          },
          {
            label: 'Evil',
            difficulty: DIFFICULTY.EVIL,
          },
        ];
        items = difficulties.map(({label, difficulty}) => {
          const onClick = () => this.setDifficulty(difficulty);
          return (
            <GameMenuItem onClick={onClick} key={difficulty}>
              {label}
            </GameMenuItem>
          );
        });
      }

      let actualMenu;

      if (this.state.menuState !== 'CHOOSE_GAME') {
        actualMenu = (
          <div className={'ss_game-menu'} key="el">
            <ul className={'ss_game-menu-list'}>
              {items}
            </ul>
          </div>
        );
      } else {
        actualMenu = <SelectSudoku newGame={this.newGame}  difficulty={this.state.difficulty}/>;
      }

      const inner = running ? [] : [actualMenu];

      return (
        <div>
          {inner}
        </div>
      );
    }
  },
);

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
      <div className={'ss_game'}>
        <GameMenu />
        <Grid.Container>
          <Grid.Row>
            <Grid.Col xs={12}>
              <div className={'ss_game-container'}>
                <GameTimer
                  startTime={game.startTime}
                  stopTime={game.stopTime}
                  offsetTime={game.offsetTime}
                />
                <PauseButton pauseGame={pauseGame} />
              </div>
            </Grid.Col>
          </Grid.Row>
          <Grid.Row>
            <Grid.Col xs={12}>
              <ConnectedSudoku />
            </Grid.Col>
          </Grid.Row>
        </Grid.Container>
      </div>
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
