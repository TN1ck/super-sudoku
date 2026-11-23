import * as React from "react";
import hotkeys from "hotkeys-js";
import {Cell, CellCoordinates} from "src/lib/engine/types";
import SudokuGame from "src/lib/game/SudokuGame";
import {ShortcutScope} from "./ShortcutScope";
import {useBoardShortcuts} from "./useBoardShortcuts";

export interface GridShortcutsProps {
  pauseGame: () => void;
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
  setNumber: (cell: CellCoordinates, number: number) => void;
  clearCell: (cell: CellCoordinates) => void;
  getHint: (cell: CellCoordinates) => void;
  setNotes: (cell: CellCoordinates, notes: number[]) => void;
  undo: () => void;
  redo: () => void;
  sudoku: Cell[];
  activeCell: Cell | undefined;
  notesMode: boolean;
  showHints: boolean;
  selectCell: (cell: CellCoordinates) => void;
  clipboardNotes: number[] | null;
  copyNotes: (notes: number[]) => void;
}

const GridShortcuts: React.FC<GridShortcutsProps> = (props) => {
  const stateRef = React.useRef(props);
  stateRef.current = props;

  useBoardShortcuts({
    scope: ShortcutScope.Game,
    sudoku: props.sudoku,
    activeCell: props.activeCell,
    selectCell: props.selectCell,
    undo: props.undo,
    redo: props.redo,
    onNumber: (cell, number) => {
      const {notesMode, showHints, sudoku, setNumber, setNotes} = stateRef.current;
      if (cell.initial) {
        return;
      }
      if (notesMode) {
        const notes = SudokuGame.visibleNotes(cell, sudoku, showHints);
        setNotes(cell, SudokuGame.toggleNote(cell, notes, number));
      } else {
        setNumber(cell, number);
      }
    },
    onClear: (cell) => {
      if (!cell.initial) {
        stateRef.current.clearCell(cell);
      }
    },
    registerExtra: (scope) => {
      hotkeys("escape", scope, () => {
        stateRef.current.pauseGame();
        return false;
      });

      hotkeys("n", scope, () => {
        if (stateRef.current.notesMode) {
          stateRef.current.deactivateNotesMode();
        } else {
          stateRef.current.activateNotesMode();
        }
        return false;
      });

      hotkeys("h", scope, () => {
        const {activeCell, getHint} = stateRef.current;
        if (activeCell && !activeCell.initial) {
          getHint(activeCell);
        }
      });

      hotkeys("ctrl+c,cmd+c", scope, () => {
        const {activeCell, copyNotes, sudoku, showHints} = stateRef.current;
        if (activeCell) {
          copyNotes(activeCell.number === 0 ? SudokuGame.visibleNotes(activeCell, sudoku, showHints) : []);
        }
        return false;
      });

      hotkeys("ctrl+v,cmd+v", scope, () => {
        const {activeCell, clipboardNotes, setNotes} = stateRef.current;
        if (activeCell && !activeCell.initial && clipboardNotes && clipboardNotes.length > 0) {
          setNotes(activeCell, clipboardNotes);
        }
        return false;
      });
    },
  });

  return null;
};

export default GridShortcuts;
