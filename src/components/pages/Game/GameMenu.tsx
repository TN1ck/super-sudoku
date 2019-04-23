import * as React from "react";

import {connect} from "react-redux";
import {setGameState, GameStateMachine} from "src/state/game";

import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/state/rootReducer";

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
  setGameState: typeof setGameState;
}

interface GameMenuStateProps {
  state: GameStateMachine;
}

const GameMenu = connect<GameMenuStateProps, GameMenuDispatchProps>(
  (state: RootState) => {
    return {
      state: state.game.state,
    };
  },
  {
    setGameState,
  },
)(
  class GameMenu extends React.Component<GameMenuStateProps & GameMenuDispatchProps> {
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
