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
import Button from 'src/components/modules/Button';

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
  chooseDifficulty
}) => {
  return (
    <GameMenuContainer>
      <GameMenuList>
        <GameMenuListItem onClick={continueGame} key="continue">
          {'Continue'}
        </GameMenuListItem>
        <GameMenuListItem onClick={chooseDifficulty} key="reset-game">
          {'New Game'}
        </GameMenuListItem>
      </GameMenuList>
    </GameMenuContainer>
  );
}

const GameMenuInitial = ({newGame}) => (
  <GameMenuContainer>
    <GameMenuList>
      <GameMenuListItem onClick={newGame} key="reset-game">
          {'New Game'}
      </GameMenuListItem>
    </GameMenuList>
  </GameMenuContainer>
);

const GameMenuSelection = ({
  setDifficulty,
  newGame,
  changeIndex,
  sudokuIndex,
  setMenu,
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
          console.log('active', active);
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
        setDifficulty={() => setMenu(MenuState.setDifficulty)}
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
      const {
        continueGame,
        setDifficulty,
        running,
        hasGame,
        setMenu,
        difficulty,
        changeIndex,
        sudokuIndex,
      } = this.props;

      if (running) {
        return null;
      }

      switch (this.props.menuState) {
        case MenuState.setDifficulty:
        case MenuState.chooseGame: {
          return (
            <GameMenuSelection
              setDifficulty={setDifficulty}
              setMenu={setMenu}
              difficulty={difficulty}
              newGame={this.newGame}
              changeIndex={changeIndex}
              sudokuIndex={sudokuIndex}
            />
          )
        }
        case MenuState.initial: {
          if (hasGame) {
            return (
              <GameMenuRunning
                continueGame={continueGame}
                chooseDifficulty={this.chooseDifficulty}
              />
            )
          }
          return (
            <GameMenuInitial
              newGame={() => this.props.setMenu(MenuState.chooseGame)}
            />
          )
        }

      }
    }
  },
);

export default GameMenu;
