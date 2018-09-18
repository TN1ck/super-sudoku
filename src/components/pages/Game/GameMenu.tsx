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
  MenuState,
} from 'src/ducks/game';
import {DIFFICULTY} from 'src/engine/utility';

import SelectSudoku from './GameSelectSudoku';

import THEME from 'src/theme';
import styled from 'styled-components';
import { RootState } from 'src/ducks';

export const GameMenuContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  position: absolute;
  z-index: 20;
  padding-top: 90px;
  border-radius: ${THEME.borderRadius}px;
  top: -${THEME.spacer.x3}px;
  bottom: -${THEME.spacer.x3}px;
  left: -${THEME.spacer.x3}px;
  right: -${THEME.spacer.x3}px;
  display: flex;
  justify-content: space-around;
`;

const GameMenuList = styled.ul`
  padding: 0;
  margin: 0;
`;

const GameMenuListItem = styled.li`
  color: white;
  background-color: ${THEME.colors.primary};
  list-style-type: none;
  margin: 0;
  margin-bottom: ${THEME.spacer.x2}px;
  padding: ${THEME.spacer.x2}px;
  border-radius: ${THEME.borderRadius}px;
  box-shadow: ${THEME.boxShadow};

  &:hover {
      cursor: pointer;
      background-color: $color__dark-blue;
  }
`;

function GameMenuItem(props) {
  return (
    <GameMenuListItem onClick={props.onClick}>
      {props.children}
    </GameMenuListItem>
  );
}

const GameMenu = connect(
  function(state: RootState) {
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
)(class GameMenu extends React.Component<
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
      this.props.setMenu(MenuState.setDifficulty);
    }
    setDifficulty(difficulty) {
      this.props.setDifficulty(difficulty);
      this.props.setMenu(MenuState.chooseGame);
    }
    newGame(sudokuId, sudoku) {
      this.props.setSudoku(this.props.difficulty, sudoku);
      this.props.newGame(this.props.difficulty, sudokuId);
      this.props.continueGame();
      this.props.setMenu(MenuState.initial);
    }
    render() {
      const {continueGame, resetGame, running, hasGame} = this.props;

      let items = [];

      if (this.props.menuState === MenuState.initial) {
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

      if (this.props.menuState === MenuState.setDifficulty) {
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

      if (this.props.menuState !== MenuState.chooseGame) {
        actualMenu = (
          <GameMenuContainer key="el">
            <GameMenuList>
              {items}
            </GameMenuList>
          </GameMenuContainer>
        );
      } else {
        actualMenu = (
          <SelectSudoku
            key='select-sudoku'
            newGame={this.newGame}
            setDifficulty={() => this.props.setMenu(MenuState.setDifficulty)}
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
