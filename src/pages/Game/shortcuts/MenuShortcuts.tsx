import * as React from "react";
import hotkeys from "hotkeys-js";
import {ShortcutScope} from "./ShortcutScope";

const MenuShortcuts: React.FC<{continueGame: () => void}> = ({continueGame}) => {
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

export default MenuShortcuts;
