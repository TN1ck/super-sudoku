import * as React from "react";
import hotkeys from "hotkeys-js";
import {SUDOKU_COORDINATES, SUDOKU_NUMBERS} from "src/lib/engine/utility";
import {Cell} from "src/lib/engine/types";
import {ShortcutScope} from "./ShortcutScope";
import SudokuGame from "src/lib/game/SudokuGame";

const GridShortcuts: React.FC<{
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
}> = ({
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
  // Use refs to store current values so shortcuts don't need to be recreated
  const stateRef = React.useRef({
    activeCell,
    notesMode,
    showHints,
    sudoku,
    selectCell,
    pauseGame,
    activateNotesMode,
    deactivateNotesMode,
    setNumber,
    clearNumber,
    getHint,
    setNotes,
    undo,
    redo,
  });

  // Update refs with current values
  React.useEffect(() => {
    stateRef.current = {
      activeCell,
      notesMode,
      showHints,
      sudoku,
      selectCell,
      pauseGame,
      activateNotesMode,
      deactivateNotesMode,
      setNumber,
      clearNumber,
      getHint,
      setNotes,
      undo,
      redo,
    };
  });

  React.useEffect(() => {
    const getCellByXY = (x: number, y: number) => {
      return stateRef.current.sudoku.find((cell) => {
        return cell.x === x && cell.y === y;
      })!;
    };

    const setDefault = () => {
      if (stateRef.current.sudoku.length > 0) {
        stateRef.current.selectCell(stateRef.current.sudoku[0]);
      }
    };

    const minCoordinate = SUDOKU_COORDINATES[0];
    const maxCoordinate = SUDOKU_COORDINATES[SUDOKU_COORDINATES.length - 1];

    hotkeys("escape", ShortcutScope.Game, () => {
      stateRef.current.pauseGame();
      return false;
    });

    hotkeys("n", ShortcutScope.Game, () => {
      if (stateRef.current.notesMode) {
        stateRef.current.deactivateNotesMode();
      } else {
        stateRef.current.activateNotesMode();
      }
      return false;
    });

    hotkeys("up", ShortcutScope.Game, () => {
      const currentCell = stateRef.current.activeCell;
      if (currentCell === undefined) {
        return setDefault();
      }
      const {x, y} = currentCell;
      const newY = Math.max(y - 1, minCoordinate);
      const nextCell = getCellByXY(x, newY);
      stateRef.current.selectCell(nextCell);
      return false;
    });

    hotkeys("down", ShortcutScope.Game, () => {
      const currentCell = stateRef.current.activeCell;
      if (currentCell === undefined) {
        return setDefault();
      }
      const {x, y} = currentCell;
      const newY = Math.min(y + 1, maxCoordinate);
      const nextCell = getCellByXY(x, newY);
      stateRef.current.selectCell(nextCell);
      return false;
    });

    hotkeys("right", ShortcutScope.Game, () => {
      const currentCell = stateRef.current.activeCell;
      if (currentCell === undefined) {
        return setDefault();
      }
      const {x, y} = currentCell;
      const newX = Math.min(x + 1, maxCoordinate);
      const nextCell = getCellByXY(newX, y);
      stateRef.current.selectCell(nextCell);
      return false;
    });

    hotkeys("left", ShortcutScope.Game, () => {
      const currentCell = stateRef.current.activeCell;
      if (currentCell === undefined) {
        return setDefault();
      }
      const {x, y} = currentCell;
      const newX = Math.max(x - 1, minCoordinate);
      const nextCell = getCellByXY(newX, y);
      stateRef.current.selectCell(nextCell);
      return false;
    });

    SUDOKU_NUMBERS.forEach((n) => {
      const keys = [String(n), `num_${n}`].join(",");
      hotkeys(keys, ShortcutScope.Game, () => {
        const {activeCell, notesMode, showHints, sudoku, setNumber, setNotes} = stateRef.current;
        if (activeCell && !activeCell.initial) {
          if (notesMode) {
            const conflicting = SudokuGame.conflictingFields(sudoku);
            const userNotes = activeCell.notes;
            const conflictingCell = conflicting[activeCell.y * 9 + activeCell.x];
            const autoNotes = showHints ? conflictingCell.possibilities : [];
            const notesToUse = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;

            const newNotes = notesToUse.includes(n) ? notesToUse.filter((note) => note !== n) : [...userNotes, n];
            setNotes(activeCell, newNotes);
          } else {
            setNumber(activeCell, n);
          }
        }
      });
    });

    hotkeys("backspace,num_subtract", ShortcutScope.Game, () => {
      const {activeCell, clearNumber} = stateRef.current;
      if (activeCell && !activeCell.initial) {
        clearNumber(activeCell);
      }
      return false;
    });

    hotkeys("h", ShortcutScope.Game, () => {
      const {activeCell, getHint} = stateRef.current;
      if (activeCell && !activeCell.initial) {
        getHint(activeCell);
      }
    });

    hotkeys("ctrl+z,cmd+z", ShortcutScope.Game, () => {
      stateRef.current.undo();
      return false;
    });

    hotkeys("ctrl+y,cmd+y", ShortcutScope.Game, () => {
      stateRef.current.redo();
      return false;
    });

    return () => {
      hotkeys.deleteScope(ShortcutScope.Game);
    };
  }, []); // Empty dependency array - shortcuts created once

  return null;
};

export default GridShortcuts;
