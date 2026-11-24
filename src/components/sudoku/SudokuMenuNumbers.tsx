import * as React from "react";
import {findCell, SUDOKU_NUMBERS} from "src/lib/engine/utility";
import {CellCoordinates, Cell} from "src/lib/engine/types";
import Button from "src/components/Button";
import clsx from "clsx";
import SudokuGame from "src/lib/game/SudokuGame";

export interface SudokuMenuNumbersProps {
  notesMode: boolean;
  activeCell?: CellCoordinates;
  showOccurrences: boolean;
  sudoku: Cell[];
  showHints: boolean;
  setNumber: (cellCoordinates: CellCoordinates, number: number) => void;
  setNotes: (cellCoordinates: CellCoordinates, notes: number[]) => void;
}

const SudokuMenuNumbers: React.FC<SudokuMenuNumbersProps> = ({
  notesMode,
  activeCell,
  showOccurrences,
  sudoku,
  showHints,
  setNumber,
  setNotes,
}) => {
  const cell = findCell(sudoku, activeCell);
  const notes = cell ? SudokuGame.visibleNotes(cell, sudoku, showHints) : [];
  const editingNotes = notesMode && cell?.number === 0;

  const occurrenceCounts = React.useMemo(() => {
    const counts = new Array<number>(10).fill(0);
    for (const c of sudoku) {
      if (c.number >= 1 && c.number <= 9) {
        counts[c.number]++;
      }
    }
    return counts;
  }, [sudoku]);

  return (
    <div className="grid w-full grid-cols-9 justify-center gap-2 overflow-hidden md:grid-cols-3">
      {SUDOKU_NUMBERS.map((n) => {
        const occurrences = occurrenceCounts[n];

        const setNumberOrNote = () => {
          if (!cell) {
            return;
          }
          if (notesMode) {
            setNotes(cell, SudokuGame.toggleNote(cell, notes, n));
          } else {
            setNumber(cell, n);
          }
        };

        const isManualNote = editingNotes && cell.notes.includes(n);
        const isAutoNote = editingNotes && cell.notes.length === 0 && notes.includes(n);
        const isExcess = showOccurrences && occurrences > 9;
        const isComplete = occurrences === 9;

        return (
          <Button
            aria-label={`Set ${n}`}
            variant={isManualNote ? "note" : "default"}
            className={clsx("relative font-bold", {
              "border-transparent bg-button-muted text-button-muted-text hover:bg-button-muted":
                isComplete && !isManualNote && !isAutoNote,
              "border-danger bg-danger text-accent-text hover:bg-danger": isExcess && !isManualNote,
              "border-note/40 bg-note-subtle text-note-subtle-text hover:bg-note-subtle": isAutoNote && !isManualNote,
            })}
            data-testid={`sudoku-number-${n}`}
            onClick={setNumberOrNote}
            key={n}
          >
            {showOccurrences && (
              <div
                className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-xl bg-accent text-xxs text-accent-text opacity-85 sm:bottom-1 sm:right-1 sm:h-4 sm:w-4 sm:text-xs"
                data-testid={`sudoku-number-occurrences-${n}`}
              >
                {occurrences}
              </div>
            )}
            {n}
          </Button>
        );
      })}
    </div>
  );
};

export default SudokuMenuNumbers;
