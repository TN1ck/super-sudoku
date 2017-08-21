import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
// import * as classNames from 'classnames';

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
import {Cell} from 'src/ducks/sudoku/model';
import {GridComponent} from 'src/components/Sudoku';
import SUDOKUS from 'src/sudokus';

// import {
//     solveGridGenerator
// } from 'src/engine/solverNaive';

import * as Grid from 'src/components/Grid';
import * as styles from './styles.css';

const Sudoku: React.StatelessComponent<{
  grid: Cell[];
}> = function _Sudoku(props) {
  return (
    <div className={styles.sudokuContainer}>
      <GridComponent grid={props.grid} />
    </div>
  );
};

// class SudokuStateComponent extends React.Component<{
//     sudoku: SudokuState
// }, {
//     grid: Array<Cell>,

// }> {
//     iterator: any;
//     constructor (props) {
//         super(props);
//         this.state = {
//             grid: this.props.sudoku.grid
//         };
//     }
//     componentDidMount () {
//         // this.solve();
//     }
//     solve () {
//         const grids = [this.props.sudoku.grid];
//         this.iterator = solveGridGenerator(grids);
//         this.setState({
//             grid: this.props.sudoku.grid
//         });
//         this.nextStep();
//     }
//     nextStep () {
//         const current = this.iterator.next();
//         if (!current.done) {
//             this.setState({
//                 grid: current.value
//             });
//             setTimeout(this.nextStep.bind(this), 0);
//         }

//     }
//     render () {
//         const grid = this.props.sudoku.grid;
//         return (
//             <Sudoku
//                 grid={grid}
//             />
//         )
//     }
// }

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
    <div onClick={pauseGame} className={styles.pauseButton}>
      {'Pause'}
    </div>
  );
}

function GameMenuItem(props) {
  return (
    <li className={styles.gameMenuListItem} onClick={props.onClick}>
      {props.children}
    </li>
  );
}

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

      if (this.state.menuState === 'CHOOSE_GAME') {
        const sudokus = SUDOKUS[this.state.difficulty];
        items = sudokus.map((sudoku, i) => {
          const onClick = () => this.newGame(i, sudoku);
          return (
            <GameMenuItem key={i} onClick={onClick}>
              {i}
            </GameMenuItem>
          );
        });
      }

      const actualMenu = (
        <div className={styles.gameMenu} key="el">
          <ul className={styles.gameMenuList}>
            {items}
          </ul>
        </div>
      );
      const inner = running ? [] : [actualMenu];

      return (
        <div>
          <ReactCSSTransitionGroup
            component="div"
            transitionName="opacity"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}
            transitionAppear
            transitionAppearTimeout={500}
          >
            {inner}
          </ReactCSSTransitionGroup>
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
      <div className={styles.game}>
        <GameMenu />
        <Grid.Container>
          <Grid.Row>
            <Grid.Col xs={12}>
              <div className={styles.gameContainer}>
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
