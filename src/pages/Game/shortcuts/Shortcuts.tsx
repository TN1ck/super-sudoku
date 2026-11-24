import React, {useEffect} from "react";
import hotkeys from "hotkeys-js";
import {GameStateMachine} from "src/context/GameContext";
import MenuShortcuts from "./MenuShortcuts";
import GridShortcuts, {GridShortcutsProps} from "./GridShortcuts";
import {ShortcutScope} from "./ShortcutScope";

interface ShortcutsProps extends GridShortcutsProps {
  gameState: GameStateMachine;
  continueGame: () => void;
  disabled?: boolean;
}

const Shortcuts: React.FC<ShortcutsProps> = ({gameState, continueGame, disabled = false, ...gridProps}) => {
  useEffect(() => {
    if (disabled) {
      hotkeys.setScope(ShortcutScope.Modal);
    } else if (gameState === GameStateMachine.paused) {
      hotkeys.setScope(ShortcutScope.Menu);
    } else if (gameState === GameStateMachine.running) {
      hotkeys.setScope(ShortcutScope.Game);
    }
  }, [disabled, gameState]);

  return (
    <>
      <MenuShortcuts continueGame={continueGame} />
      <GridShortcuts {...gridProps} />
    </>
  );
};

export default Shortcuts;
