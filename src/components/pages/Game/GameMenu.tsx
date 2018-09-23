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
  toggleShowHints,
} from 'src/ducks/game';
import {DIFFICULTY} from 'src/engine/utility';

import SelectSudoku from './GameSelectSudoku';

import THEME from 'src/theme';
import styled from 'styled-components';
import { RootState } from 'src/ducks';
import Button from 'src/components/modules/Button';
import Checkbox from 'src/components/modules/Checkbox';

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

const GameMenuRunning = ({
  continueGame,
  chooseGame,
  toggleShowHints,
  showHints,
}) => {
  return (
    <GameMenuContainer>
      <GameMenuList>
        <Checkbox id='hints' checked={showHints} onChange={toggleShowHints}>
          {'Show all hints'}
        </Checkbox>>
        <GameMenuListItem onClick={continueGame} key="continue">
          {'Continue'}
        </GameMenuListItem>
        <GameMenuListItem onClick={chooseGame} key="reset-game">
          {'New Game'}
        </GameMenuListItem>
      </GameMenuList>
    </GameMenuContainer>
  );
}

const GameMenuSelection = ({
  setDifficulty,
  newGame,
  changeIndex,
  sudokuIndex,
  difficulty,
}) => {
  const currentDifficulty = difficulty;
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
  return (
    <GameMenuContainer>
      <div style={{display: 'flex', justifyContent: "center", width: '100%', height: '40px'}}>
        {difficulties.map(({label, difficulty}, i) => {
          const onClick = () => setDifficulty(difficulty);
          const active = difficulty === currentDifficulty;
          return (
            <Button
              style={{
                marginLeft: i === 0 ? 0 : THEME.spacer.x2,
              }}
              onClick={onClick}
              key={difficulty}
              active={active}
            >
              {label}
            </Button>
          );
        })}
      </div>
      <SelectSudoku
        key='select-sudoku'
        newGame={newGame}
        difficulty={currentDifficulty}
        changeIndex={changeIndex}
        sudokuIndex={sudokuIndex}
      />
    </GameMenuContainer>
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
      showHints: state.game.showHints,
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
    toggleShowHints,
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
      toggleShowHints: typeof toggleShowHints;
      showHints: boolean;
      running: boolean;
      hasGame: boolean;
      sudokuIndex: number;
      menuState: string;
      difficulty: DIFFICULTY;
    }
  > {
    constructor(props) {
      super(props);
      this.newGame = this.newGame.bind(this);
    }
    newGame(sudokuId, sudoku) {
      this.props.setSudoku(this.props.difficulty, sudoku);
      this.props.newGame(this.props.difficulty, sudokuId);
      this.props.continueGame();
      this.props.setMenu(MenuState.running);
    }
    render() {
      const {
        continueGame,
        setDifficulty,
        running,
        hasGame,
        difficulty,
        changeIndex,
        sudokuIndex,
        toggleShowHints,
        showHints,
      } = this.props;

      if (running) {
        return null;
      }

      switch (this.props.menuState) {
        case MenuState.chooseGame: {
          return (
            <GameMenuSelection
              setDifficulty={setDifficulty}
              difficulty={difficulty}
              newGame={this.newGame}
              changeIndex={changeIndex}
              sudokuIndex={sudokuIndex}
            />
          )
        }
        case MenuState.running: {
          if (hasGame) {
            return (
              <GameMenuRunning
                continueGame={continueGame}
                chooseGame={() => this.props.setMenu(MenuState.chooseGame)}
                toggleShowHints={toggleShowHints}
                showHints={showHints}
              />
            )
          }
        }

      }
    }
  },
);

export default GameMenu;
