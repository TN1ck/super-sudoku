import React from "react";
import key from "keymaster";
import {GameStateMachine} from "src/state/game";
import MenuShortcuts from "./MenuShortcuts";
import GridShortcuts from "./GridShortcuts";
import GameSelectShortcuts from "./GameSelectShortcuts";
import {ShortcutScope} from "./ShortcutScope";
import {ApplicationStateMachine} from "src/state/application";

interface ShortcutsProps {
  gameState: GameStateMachine;
  applicationState: ApplicationStateMachine;
}

export default class Shortcuts extends React.Component<ShortcutsProps> {
  componentDidUpdate() {
    this.selectShortcutState();
  }

  componentWillMount() {
    this.selectShortcutState();
  }

  selectShortcutState() {
    if (this.props.gameState === GameStateMachine.paused) {
      key.setScope(ShortcutScope.Menu);
    }
    if (this.props.gameState === GameStateMachine.running) {
      key.setScope(ShortcutScope.Game);
    }
    if (this.props.applicationState === ApplicationStateMachine.chooseGame) {
      key.setScope(ShortcutScope.SelectSudoku);
    }
  }
  render() {
    return (
      <div>
        <MenuShortcuts />
        <GridShortcuts />
        <GameSelectShortcuts />
      </div>
    );
  }
}
