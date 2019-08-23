import * as React from "react";

import {connect} from "react-redux";
import {GameStateMachine} from "src/state/game";
import {chooseGame, ApplicationStateMachine} from "src/state/application";

import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/state/rootReducer";

import GameSelect from "./GameSelect";
import Button from "src/components/modules/Button";
import {Container} from "src/components/modules/Layout";

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
      <Container>
        <GameMenuCenter>
          <GameWonText>{"Congratulations, You won!"}</GameWonText>
          <NewGameButton onClick={chooseGame} key="reset-game">
            {"New Game"}
          </NewGameButton>
        </GameMenuCenter>
      </Container>
    </GameMenuContainer>
  );
};

const GameMenuSelection = () => {
  return (
    <GameMenuContainer>
      <Container>
        <GameSelect />
      </Container>
    </GameMenuContainer>
  );
};

interface GameMenuDispatchProps {
  chooseGame: typeof chooseGame;
}

interface GameMenuStateProps {
  applicationState: ApplicationStateMachine;
  gameState: GameStateMachine;
}

const GameMenu = connect<GameMenuStateProps, GameMenuDispatchProps>(
  (state: RootState) => {
    return {
      gameState: state.game.state,
      applicationState: state.application.state,
    };
  },
  {
    chooseGame,
  },
)(
  class GameMenu extends React.Component<GameMenuStateProps & GameMenuDispatchProps> {
    render() {
      if (this.props.applicationState === ApplicationStateMachine.chooseGame) {
        return <GameMenuSelection />;
      }
      if (this.props.gameState === GameStateMachine.wonGame) {
        return <WonGame chooseGame={chooseGame} />;
      }
      return null;
    }
  },
);

export default GameMenu;
