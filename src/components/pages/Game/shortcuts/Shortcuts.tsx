import React from "react";
import hotkeys from "hotkeys-js";
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
      hotkeys.setScope(ShortcutScope.Menu);
    }
    if (this.props.gameState === GameStateMachine.running) {
      hotkeys.setScope(ShortcutScope.Game);
    }
    if (this.props.applicationState === ApplicationStateMachine.chooseGame) {
      hotkeys.setScope(ShortcutScope.SelectSudoku);
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
