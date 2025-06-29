import * as React from "react";
import {Sudoku} from "src/components/sudoku/Sudoku";
import {EraseButton, UndoButton} from "src/components/sudoku/SudokuMenuControls";
import SudokuMenuNumbers from "src/components/sudoku/SudokuMenuNumbers";
import {emptyGrid} from "src/context/SudokuContext";

const NewSudoku = () => {
  return (
    <div>
      <div className="text-white text-lg sm:text-2xl font-bold">Create new sudoku</div>
      <div className="flex gap-4 flex-col md:flex-row">
        <main className="mt-4 flex-grow md:min-w-96">
          <Sudoku
            sudoku={emptyGrid}
            showHints={false}
            showWrongEntries={false}
            showConflicts={false}
            shouldShowMenu={false}
            setNumber={() => {}}
            setNotes={() => {}}
            clearNumber={() => {}}
            notesMode={false}
            showMenu={() => {}}
            hideMenu={() => {}}
            selectCell={() => {}}
            children={<></>}
          />
        </main>
        <div className="mt-4 flex-grow flex flex-col gap-4">
          <SudokuMenuNumbers
            notesMode={false}
            showOccurrences={false}
            activeCell={undefined}
            sudoku={emptyGrid}
            showHints={false}
            setNumber={() => {}}
            setNotes={() => {}}
          />
          <div className="grid w-full grid-cols-4 gap-2">
            <UndoButton canUndo={false} undo={() => {}} />
            <EraseButton activeCellCoordinates={{x: 0, y: 0}} clearCell={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSudoku;
