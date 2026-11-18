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

  return (
    <div className="grid w-full overflow-hidden justify-center gap-2 md:grid-cols-3 grid-cols-9">
      {SUDOKU_NUMBERS.map((n) => {
        const occurrences = sudoku.filter((c) => c.number === n).length;

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

        return (
          <Button
            aria-label={`Set ${n}`}
            className={clsx("relative font-bold", {
              "bg-gray-400": occurrences == 9,
              "bg-red-400 dark:bg-red-400": showOccurrences && occurrences > 9,
              "bg-sky-600 dark:bg-sky-600 text-white": editingNotes && cell.notes.includes(n),
              "bg-sky-300 dark:bg-sky-300": editingNotes && cell.notes.length === 0 && notes.includes(n),
            })}
            data-testid={`sudoku-number-${n}`}
            onClick={setNumberOrNote}
            key={n}
          >
            {showOccurrences && (
              <div
                className="absolute right-0 bottom-0 h-3 w-3 rounded-xl bg-teal-700 text-xxs text-white opacity-70 sm:right-1 sm:bottom-1 sm:h-4 sm:w-4 sm:text-xs "
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
