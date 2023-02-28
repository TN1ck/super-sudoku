import * as React from "react";
import hotkeys from "hotkeys-js";
import {ShortcutScope} from "./ShortcutScope";
import {continueGame} from "src/state/game";
import {connect} from "react-redux";

interface GameMenuShortcutsDispatchProps {
  continueGame: typeof continueGame;
}

// TODO
class GameMenuShortcuts extends React.Component<GameMenuShortcutsDispatchProps> {
  componentDidMount() {
    hotkeys("esc", ShortcutScope.Menu, () => {
      this.props.continueGame();
      return false;
    });
    hotkeys("up", ShortcutScope.Menu, () => {
      console.log("up");
      return false;
    });
    hotkeys("down", ShortcutScope.Menu, () => {
      console.log("down");
      return false;
    });
    hotkeys("enter", ShortcutScope.Menu, () => {
      console.log("enter");
      return false;
    });
  }
  componentWillUnmount() {
    hotkeys.deleteScope(ShortcutScope.Menu);
  }
  render() {
    return null;
  }
}

export default connect<{}, GameMenuShortcutsDispatchProps>(null, {continueGame})(GameMenuShortcuts);
