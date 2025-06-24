import React, {useEffect} from "react";
import hotkeys from "hotkeys-js";
import {GameStateMachine} from "src/context/GameContext";
import MenuShortcuts from "./MenuShortcuts";
import GridShortcuts from "./GridShortcuts";
import {ShortcutScope} from "./ShortcutScope";

interface ShortcutsProps {
  gameState: GameStateMachine;
}

const Shortcuts: React.FC<ShortcutsProps> = ({gameState}) => {
  useEffect(() => {
    selectShortcutState();
  }, [gameState]);

  const selectShortcutState = () => {
    if (gameState === GameStateMachine.paused) {
      hotkeys.setScope(ShortcutScope.Menu);
    }
    if (gameState === GameStateMachine.running) {
      hotkeys.setScope(ShortcutScope.Game);
    }
  };

  return (
    <div>
      <MenuShortcuts />
      <GridShortcuts />
    </div>
  );
};

export default Shortcuts;
