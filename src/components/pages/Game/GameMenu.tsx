import * as React from 'react';

import {connect} from 'react-redux';
import {setSudoku} from 'src/ducks/sudoku';
import {
  changeIndex,
  continueGame,
  resetGame,
  newGame,
  setMenu,
  setDifficulty,
} from 'src/ducks/game';
import {DIFFICULTY} from 'src/engine/utility';

import SelectSudoku from './GameSelectSudoku';

import './styles.scss';

function GameMenuItem(props) {
  return (
    <li className={'ss_game-menu-list-item'} onClick={props.onClick}>
      {props.children}
    </li>
  );
}

const GameMenu = connect(
  function(state) {
    return {
      running: state.game.running,
      hasGame: state.game.currentlySelectedSudokuId !== undefined,
      sudokuIndex: state.game.sudokuIndex,
      menuState: state.game.menu,
      difficulty: state.game.difficulty,
    };
  },
  {
    continueGame,
    resetGame,
    newGame,
    setSudoku,
    changeIndex,
    setMenu,
    setDifficulty,
  },
)(
  class GameMenu extends React.Component<
    {
      continueGame: typeof continueGame;
      resetGame: typeof resetGame;
      newGame: typeof newGame;
      setSudoku: typeof setSudoku;
      changeIndex: typeof changeIndex,
      setMenu: typeof setMenu;
      setDifficulty: typeof setDifficulty;
      running: boolean;
      hasGame: boolean;
      sudokuIndex: number;
      menuState: string;
      difficulty: DIFFICULTY;
    }
  > {
    constructor(props) {
      super(props);
      this.chooseDifficulty = this.chooseDifficulty.bind(this);
      this.setDifficulty = this.setDifficulty.bind(this);
      this.newGame = this.newGame.bind(this);
    }
    chooseDifficulty() {
      this.props.setMenu('SET_DIFFICULTY');
    }
    setDifficulty(difficulty) {
      this.props.setDifficulty(difficulty);
      this.props.setMenu('CHOOSE_GAME');
    }
    newGame(sudokuId, sudoku) {
      this.props.setSudoku(this.props.difficulty, sudoku);
      this.props.newGame(this.props.difficulty, sudokuId);
      this.props.continueGame();
      this.props.setMenu('INITIAL');
    }
    render() {
      const {continueGame, resetGame, running, hasGame} = this.props;

      let items = [];

      if (this.props.menuState === 'INITIAL') {
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

      if (this.props.menuState === 'SET_DIFFICULTY') {
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

      if (this.props.menuState !== 'CHOOSE_GAME') {
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
            difficulty={this.props.difficulty}
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

export default GameMenu;
