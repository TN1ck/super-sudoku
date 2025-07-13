import React, {useEffect} from "react";
import hotkeys from "hotkeys-js";
import {GameStateMachine} from "src/context/GameContext";
import MenuShortcuts from "./MenuShortcuts";
import GridShortcuts from "./GridShortcuts";
import {ShortcutScope} from "./ShortcutScope";
import {Cell} from "src/lib/engine/types";

interface ShortcutsProps {
  gameState: GameStateMachine;
  continueGame: () => void;
  pauseGame: () => void;
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
  setNumber: (cell: Cell, number: number) => void;
  clearNumber: (cell: Cell) => void;
  getHint: (cell: Cell) => void;
  setNotes: (cell: Cell, notes: number[]) => void;
  undo: () => void;
  redo: () => void;
  sudoku: Cell[];
  activeCell: Cell | undefined;
  notesMode: boolean;
  showHints: boolean;
  selectCell: (cell: Cell) => void;
}

const Shortcuts: React.FC<ShortcutsProps> = ({
  gameState,
  continueGame,
  pauseGame,
  activateNotesMode,
  deactivateNotesMode,
  setNumber,
  clearNumber,
  getHint,
  setNotes,
  undo,
  redo,
  sudoku,
  activeCell,
  notesMode,
  showHints,
  selectCell,
}) => {
  useEffect(() => {
    if (gameState === GameStateMachine.paused) {
      hotkeys.setScope(ShortcutScope.Menu);
    }
    if (gameState === GameStateMachine.running) {
      hotkeys.setScope(ShortcutScope.Game);
    }
  }, [gameState]);

  return (
    <div>
      <MenuShortcuts continueGame={continueGame} />
      <GridShortcuts
        continueGame={continueGame}
        pauseGame={pauseGame}
        activateNotesMode={activateNotesMode}
        deactivateNotesMode={deactivateNotesMode}
        setNumber={setNumber}
        clearNumber={clearNumber}
        getHint={getHint}
        setNotes={setNotes}
        undo={undo}
        redo={redo}
        sudoku={sudoku}
        activeCell={activeCell}
        notesMode={notesMode}
        showHints={showHints}
        selectCell={selectCell}
      />
    </div>
  );
};

export default Shortcuts;
