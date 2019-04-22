import React from "react";
import key from "keymaster";
import {GameStateMachine} from "src/ducks/game";
import MenuShortcuts from "./MenuShortcuts";
import GridShortcuts from "./GridShortcuts";
import GameSelectShortcuts from "./GameSelectShortcuts";
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
      key.setScope(ShortcutScope.Menu);
    }
    if (this.props.gameState === GameStateMachine.running) {
      key.setScope(ShortcutScope.Game);
    }
    if (this.props.gameState === GameStateMachine.chooseGame) {
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
