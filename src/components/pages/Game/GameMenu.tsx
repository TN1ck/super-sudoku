import * as React from "react";

import {connect, ConnectedProps} from "react-redux";
import {GameStateMachine, continueGame} from "src/state/game";
import {chooseGame, playGame, ApplicationStateMachine} from "src/state/application";
import {Dialog} from "@headlessui/react";

import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/state/rootReducer";

import GameSelect from "./GameSelect";
import Button from "src/components/modules/Button";

const AbsoluteContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

const ModalInner = styled.div`
  width: 80vw;
  background: ${THEME.colors.background};
  margin: 0 auto;
  border-radius: ${THEME.borderRadius}px;
`;

const WonGame = ({chooseGame}: {chooseGame: () => void}) => {
  return (
    <AbsoluteContainer>
      <GameMenuCenter>
        <GameWonText>{"Congratulations, You won!"}</GameWonText>
        <NewGameButton onClick={chooseGame} key="reset-game">
          {"New Game"}
        </NewGameButton>
      </GameMenuCenter>
    </AbsoluteContainer>
  );
};

const GameMenuSelection = () => {
  console.log("gome menu selection");
  return (
    <ModalInner>
      <GameSelect />
    </ModalInner>
  );
};

interface GameMenuStateProps {
  applicationState: ApplicationStateMachine;
  gameState: GameStateMachine;
}

const connector = connect(
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
);

type PropsFromRedux = ConnectedProps<typeof connector>;

class GameMenu extends React.Component<GameMenuStateProps & PropsFromRedux, {isOpen: boolean}> {
  constructor(props: GameMenuStateProps & PropsFromRedux) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }
  setOpen = (open: boolean) => {
    this.setState({isOpen: open});
  };
  getApplicationNode = () => {
    return document.getElementById("#root");
  };
  render() {
    console.log("render", this.props.applicationState);
    if (this.props.applicationState === ApplicationStateMachine.chooseGame) {
      const onExit = () => {
        console.log("on exit");
        this.props.playGame();
        this.props.continueGame();
      };

      return (
        <div>
          <Dialog
            className="fixed inset-0 z-30 overflow-y-auto"
            open={this.props.applicationState === ApplicationStateMachine.chooseGame}
            onClose={onExit}
          >
            <Dialog.Overlay
              className="fixed inset-0 bg-white bg-opacity-30 transition-opacity"
              style={{
                zIndex: -1,
              }}
            />
            <Dialog.Panel className="z-10 h-screen w-screen p-4">
              <GameMenuSelection />
            </Dialog.Panel>
          </Dialog>
          <Dialog open={this.props.gameState === GameStateMachine.wonGame} onClose={() => this.setOpen(false)}>
            <Dialog.Panel>
              <WonGame chooseGame={this.props.chooseGame} />
            </Dialog.Panel>
          </Dialog>
        </div>
      );
    }
    return null;
  }
}

export default connector(GameMenu);
