import * as React from "react";

import {connect, ConnectedProps} from "react-redux";
import {GameStateMachine, continueGame} from "src/state/game";
import {chooseGame, playGame, ApplicationStateMachine} from "src/state/application";
import {Dialog} from "@headlessui/react";

import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/state/rootReducer";

import GameSelect from "./GameSelect";

const ModalInner = styled.div`
  width: 80vw;
  height: 100%;
  background: ${THEME.colors.background};
  margin: 0 auto;
  border-radius: ${THEME.borderRadius}px;
`;

const GameMenuSelection = () => {
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
    if (this.props.applicationState === ApplicationStateMachine.chooseGame) {
      const onExit = () => {
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
            <Dialog.Panel style={{height: `calc(100vh - 28px)`}} className="z-10 w-screen p-4">
              <GameMenuSelection />
            </Dialog.Panel>
          </Dialog>
        </div>
      );
    }
    return null;
  }
}

export default connector(GameMenu);
