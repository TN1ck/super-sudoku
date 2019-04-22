import * as React from "react";
import key from "keymaster";
import {ShortcutScope} from "./ShortcutScope";
import {continueGame} from "src/ducks/game";
import {connect} from "react-redux";

interface GameMenuShortcutsDispatchProps {
  continueGame: typeof continueGame;
}

// TODO
class GameMenuShortcuts extends React.Component<GameMenuShortcutsDispatchProps> {
  componentDidMount() {
    key("esc", ShortcutScope.Menu, () => {
      this.props.continueGame();
      return false;
    });
    key("up", ShortcutScope.Menu, () => {
      console.log("up");
      return false;
    });
    key("down", ShortcutScope.Menu, () => {
      console.log("down");
      return false;
    });
    key("enter", ShortcutScope.Menu, () => {
      console.log("enter");
      return false;
    });
  }
  componentWillUnmount() {
    key.deleteScope(ShortcutScope.Menu);
  }
  render() {
    return null;
  }
}

export default connect<{}, GameMenuShortcutsDispatchProps>(
  null,
  {continueGame},
)(GameMenuShortcuts);
