import * as React from "react";
import * as Modal from "react-aria-modal";

import {connect} from "react-redux";
import {GameStateMachine, continueGame} from "src/state/game";
import {chooseGame, playGame, ApplicationStateMachine} from "src/state/application";

import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/state/rootReducer";

import GameSelect from "./GameSelect";
import Button from "src/components/modules/Button";
import {Container} from "src/components/modules/Layout";

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

const ModalInner = styled.div`
  width: 80vw;
  background: ${THEME.colors.background};
  margin: 0 auto;
  border-radius: ${THEME.borderRadius}px;
`;

const WonGame = ({chooseGame}) => {
  return (
    <Container>
      <GameMenuCenter>
        <GameWonText>{"Congratulations, You won!"}</GameWonText>
        <NewGameButton onClick={chooseGame} key="reset-game">
          {"New Game"}
        </NewGameButton>
      </GameMenuCenter>
    </Container>
  );
};

const GameMenuSelection = () => {
  return (
    <ModalInner>
      <GameSelect />
    </ModalInner>
  );
};

interface GameMenuDispatchProps {
  chooseGame: typeof chooseGame;
  playGame: typeof playGame;
  continueGame: typeof continueGame;
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
    playGame,
    continueGame,
  },
)(
  class GameMenu extends React.Component<GameMenuStateProps & GameMenuDispatchProps> {
    getApplicationNode = () => {
      return document.getElementById("#root");
    };
    render() {
      if (this.props.applicationState === ApplicationStateMachine.chooseGame) {
        const onExit = () => {
          this.props.playGame();
          this.props.continueGame();
        };

        return (
          <Modal
            underlayStyle={{paddingTop: THEME.spacer.x3}}
            initialFocus="#tab-easy"
            titleText="Select a game."
            getApplicationNode={this.getApplicationNode}
            onExit={onExit}
          >
            <GameMenuSelection />
          </Modal>
        );
      }
      if (this.props.gameState === GameStateMachine.wonGame) {
        return (
          <Modal initialFocus="#demo-one-deactivate" titleText="You won!" getApplicationNode={this.getApplicationNode}>
            <WonGame chooseGame={this.props.chooseGame} />
          </Modal>
        );
      }
      return null;
    }
  },
);

export default GameMenu;
