import * as React from "react";
import hotkeys from "hotkeys-js";
import {ShortcutScope} from "./ShortcutScope";
import {useGame} from "src/context/GameContext";

const GameMenuShortcuts: React.FC = () => {
  const {continueGame} = useGame();

  React.useEffect(() => {
    hotkeys("esc", ShortcutScope.Menu, () => {
      continueGame();
      return false;
    });

    return () => {
      hotkeys.deleteScope(ShortcutScope.Menu);
    };
  }, [continueGame]);

  return null;
};

export default GameMenuShortcuts;
