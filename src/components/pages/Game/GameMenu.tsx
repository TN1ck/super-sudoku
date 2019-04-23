import * as React from "react";

import {connect} from "react-redux";
import {setSudoku} from "src/state/sudoku";
import {continueGame, resetGame, newGame, setGameState, toggleShowHints, GameStateMachine} from "src/state/game";
import {DIFFICULTY} from "src/engine/types";

import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/state/rootReducer";
import {changeSudoku, setDifficulty, previousSudoku, nextSudoku} from "src/state/choose";

import GameSelect from "./GameSelect";
import Button from "src/components/modules/Button";

export const GameMenuContainer = styled.div`
  // rgba hex colors
  background-color: ${THEME.colors.background + "AA"};
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

const GameMenuCenter = styled.div`
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
`;

const GameWonText = styled.div`
  color: ${THEME.colors.foreground};
  font-size: 32px;
  padding-bottom: ${THEME.spacer.x3}px;
`;

const NewGameButton = styled(Button)`
  display: block;
`;

const WonGame = ({chooseGame}) => {
  return (
    <GameMenuContainer>
      <GameMenuCenter>
        <GameWonText>{"Congratulations, You won!"}</GameWonText>
        <NewGameButton onClick={chooseGame} key="reset-game">
          {"New Game"}
        </NewGameButton>
      </GameMenuCenter>
    </GameMenuContainer>
  );
};

const GameMenuSelection = () => {
  return (
    <GameMenuContainer>
      <GameSelect />
    </GameMenuContainer>
  );
};

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
          return <GameMenuSelection />;
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
