import React from "react";
import hotkeys from "hotkeys-js";
import {GameStateMachine} from "src/state/game";
import MenuShortcuts from "./MenuShortcuts";
import GridShortcuts from "./GridShortcuts";
import {ShortcutScope} from "./ShortcutScope";

interface ShortcutsProps {
  gameState: GameStateMachine;
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
  }
  render() {
    return (
      <div>
        <MenuShortcuts />
        <GridShortcuts />
      </div>
    );
  }
}
