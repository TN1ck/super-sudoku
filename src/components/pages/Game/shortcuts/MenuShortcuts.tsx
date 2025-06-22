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
  }
  componentWillUnmount() {
    hotkeys.deleteScope(ShortcutScope.Menu);
  }
  render() {
    return null;
  }
}

export default connect<{}, GameMenuShortcutsDispatchProps>(null, {continueGame})(GameMenuShortcuts);
