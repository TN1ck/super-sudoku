import * as React from "react";
import {SUDOKU_NUMBERS} from "src/lib/engine/utility";
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
  return (
    <div className="grid w-full overflow-hidden justify-center gap-2 md:grid-cols-3 grid-cols-9">
      {SUDOKU_NUMBERS.map((n) => {
        const occurrences = sudoku.filter((c) => c.number === n).length;

        const conflicting = SudokuGame.conflictingFields(sudoku);

        const activeCellData = activeCell ? sudoku[activeCell.y * 9 + activeCell.x] : undefined;
        const userNotes = activeCellData?.notes ?? [];
        const conflictingCell = activeCell ? conflicting[activeCell.y * 9 + activeCell.x] : undefined;
        const autoNotes = (showHints ? conflictingCell?.possibilities : []) ?? [];

        const setNumberOrNote = () => {
          if (!activeCell) {return;}

          if (notesMode) {
            const startingNotes = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;

            const newNotes = startingNotes.includes(n) ? startingNotes.filter((note) => note !== n) : [...userNotes, n];
            setNotes(activeCell, newNotes);
          } else {
            setNumber(activeCell, n);
          }
        };

        return (
          <Button
            className={clsx("relative font-bold", {
              "bg-gray-400": occurrences == 9,
              "bg-red-400 dark:bg-red-400": showOccurrences && occurrences > 9,
              "bg-sky-600 dark:bg-sky-600 text-white":
                notesMode && userNotes.includes(n) && activeCellData?.number === 0,
              "bg-sky-300 dark:bg-sky-300":
                notesMode &&
                userNotes.length === 0 &&
                autoNotes.includes(n) &&
                !userNotes.includes(n) &&
                activeCellData?.number === 0,
            })}
            onClick={setNumberOrNote}
            key={n}
          >
            {showOccurrences && (
              <div className="absolute right-0 bottom-0 h-3 w-3 rounded-xl bg-teal-700 text-xxs text-white opacity-70 sm:right-1 sm:bottom-1 sm:h-4 sm:w-4 sm:text-xs ">
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
