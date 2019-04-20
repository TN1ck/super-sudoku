import * as React from "react";

import {connect} from "react-redux";
import {setSudoku} from "src/ducks/sudoku";
import {continueGame, resetGame, newGame, setGameState, toggleShowHints, GameStateMachine} from "src/ducks/game";
import {DIFFICULTY} from "src/engine/utility";

import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/ducks";
import {changeSudoku, setDifficulty, previousSudoku, nextSudoku} from "src/ducks/game/choose";

import GameSelect from "./GameSelect";


export const GameMenuContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  position: absolute;
  z-index: 20;
  border-radius: ${THEME.borderRadius}px;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
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
  margin-top: ${THEME.spacer.x2}px;
  padding: ${THEME.spacer.x2}px;
  border-radius: ${THEME.borderRadius}px;
  box-shadow: ${THEME.boxShadow};

  &:hover {
    cursor: pointer;
    background-color: $color__dark-blue;
  }
`;

const GameWonText = styled.div`
  color: white;
  font-size: 32px;
  padding-bottom: ${THEME.spacer.x3};
`;

const WonGame = ({chooseGame}) => {
  return (
    <GameMenuContainer>
      <GameMenuList>
        <GameWonText>{"Congratulations, You won!"}</GameWonText>
        <GameMenuListItem onClick={chooseGame} key="reset-game">
          {"New Game"}
        </GameMenuListItem>
      </GameMenuList>
    </GameMenuContainer>
  );
};

const GameMenuSelection = () => {
  return (
    <GameMenuContainer>
      <GameSelect />
    </GameMenuContainer>
  )
}

interface GameMenuDispatchProps {
  continueGame: typeof continueGame;
  resetGame: typeof resetGame;
  newGame: typeof newGame;
  setSudoku: typeof setSudoku;
  changeSudoku: typeof changeSudoku;
  nextSudoku: typeof nextSudoku;
  previousSudoku: typeof previousSudoku;
  setGameState: typeof setGameState;
  setDifficulty: typeof setDifficulty;
  toggleShowHints: typeof toggleShowHints;
}

interface GameMenuStateProps {
  showHints: boolean;
  sudokuIndex: number;
  state: GameStateMachine;
  difficulty: DIFFICULTY;
}

const GameMenu = connect<GameMenuStateProps, GameMenuDispatchProps>(
  (state: RootState) => {
    return {
      sudokuIndex: state.choose.sudokuIndex,
      state: state.game.state,
      difficulty: state.choose.difficulty,
      showHints: state.game.showHints,
    };
  },
  {
    continueGame,
    resetGame,
    newGame,
    setSudoku,
    changeSudoku,
    nextSudoku,
    previousSudoku,
    setGameState,
    setDifficulty,
    toggleShowHints,
  },
)(
  class GameMenu extends React.Component<GameMenuStateProps & GameMenuDispatchProps> {
    constructor(props) {
      super(props);
      this.newGame = this.newGame.bind(this);
    }
    newGame(_, sudoku, solution) {
      this.props.setSudoku(this.props.difficulty, sudoku, solution);
      this.props.newGame();
      this.props.continueGame();
      this.props.setGameState(GameStateMachine.running);
    }
    render() {
      const chooseGame = () => this.props.setGameState(GameStateMachine.chooseGame);

      switch (this.props.state) {
        case GameStateMachine.chooseGame: {
          return (
            <GameMenuSelection />
          );
        }
        case GameStateMachine.wonGame: {
          return <WonGame chooseGame={chooseGame} />;
        }
        default:
          return null;
      }
    }
  },
);

export default GameMenu;
