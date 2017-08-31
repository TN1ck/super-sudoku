import * as React from 'react';
import * as _ from 'lodash';

import {connect} from 'react-redux';
import {SudokuState, setSudoku} from 'src/ducks/sudoku';
import {
  changeIndex,
  pauseGame,
  continueGame,
  resetGame,
  newGame,
  GameState,
  getTime,
} from 'src/ducks/game';
import {DIFFICULTY} from 'src/engine/utility';

import {Cell, parseSudoku} from 'src/ducks/sudoku/model';
import {GridComponent, SmallSudokuComponent} from 'src/components/modules/Sudoku';
import {Section} from 'src/components/modules/Layout';

import SUDOKUS from 'src/sudokus';

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
  sudokuIndex: number;
  changeIndex: typeof changeIndex;
}> = function({newGame, difficulty, sudokuIndex, changeIndex}) {

  const SUDOKU_SHOW = 8;
  const sudokus = PARSED_SUDOKUS[difficulty];

  const _sudokusToShow = [];

  for (const i of _.range(1, SUDOKU_SHOW)) {
    const currentIndex = sudokuIndex - i;
    _sudokusToShow.push(sudokus[(currentIndex + sudokus.length) % sudokus.length]);
  }
  _sudokusToShow.reverse();
  _sudokusToShow.push(sudokus[sudokuIndex]);
  for (const i of _.range(1, SUDOKU_SHOW)) {
    const currentIndex = sudokuIndex + i;
    _sudokusToShow.push(sudokus[(currentIndex) % sudokus.length]);
  }

  const step = 100 / (SUDOKU_SHOW - 1);
  const startStep = -100;

  const sudokusToShow = _sudokusToShow.map((sudoku, i) => {
    const middle = _sudokusToShow.length / 2;
    // const isMiddle = i === sudokuIndex;
    const isLeft = i < middle;
    const isRight = i > middle;
    const isActive = sudokuIndex === sudoku.id;
    let zIndex = 0;
    if (isRight) {
      zIndex = -i;
    }
    if (isActive) {
      zIndex = middle * 2 + 1;
    }

    const offset = isActive ? 0 : (isLeft ? -70 : 70);
    console.log(offset);
    return {
      sudoku,
      elevation: isActive ? 4 : 1,
      style: {
        opacity: 1 - Math.abs(startStep + i * step) / 100,
        transform: `translate(${(startStep + i * step) + offset}%, 0) ${isActive ? 'scale(1.1)' : `perspective(600px) rotateY(${isLeft ? '' : '-'}60deg)`}`,
        zIndex,
      },
    };
  });

  const items = sudokusToShow.map(({sudoku, style, elevation}) => {
    const {sudoku: sudokuCells, id, value} = sudoku;
    const isCenter = id === sudokuIndex;
    const onClick = () => {
      if (isCenter) {
        newGame(id, value);
      } else {
        changeIndex(id);
      }
    };
    return (
      <div
        key={id}
        className={`ss_elevation-${elevation}`}
        style={{
          position: 'absolute',
          ...style,
          transitionProperty: 'transform, opacity, box-shadow',
          transitionDuration: '500ms',
          transitionTimingFunction: 'ease-out',
        }}
      >
        <SmallSudokuComponent
          darken={!isCenter}
          id={id}
          onClick={onClick}
          sudoku={sudokuCells}
        />
      </div>
    );
  });

  return (
    <div className={'ss_game-menu ss_game-menu--sudokus'} key="el">
      {items}
      <div style={{position: 'absolute', top: 300}}>
        <button onClick={() => {
          changeIndex((sudokuIndex - 1 + sudokus.length) % sudokus.length);
        }}>
          {'left'}
        </button>
        <button onClick={() => {
          changeIndex((sudokuIndex + 1) % sudokus.length);
        }}>
          {'right'}
        </button>
      </div>
    </div>
  );
};

const GameMenu = connect(
  function(state) {
    return {
      running: state.game.running,
      hasGame: state.game.currentlySelectedSudokuId !== undefined,
      sudokuIndex: state.game.sudokuIndex,
    };
  },
  {
    continueGame,
    resetGame,
    newGame,
    setSudoku,
    changeIndex,
  },
)(
  class GameMenu extends React.Component<
    {
      continueGame: typeof continueGame;
      resetGame: typeof resetGame;
      newGame: typeof newGame;
      setSudoku: typeof setSudoku;
      changeIndex: typeof changeIndex,
      running: boolean;
      hasGame: boolean;
      sudokuIndex: number;
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
        actualMenu = (
          <SelectSudoku
            newGame={this.newGame}
            difficulty={this.state.difficulty}
            changeIndex={this.props.changeIndex}
            sudokuIndex={this.props.sudokuIndex}
          />
        );
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
