import * as React from "react";
import Button from "src/components/Button";
import {Sudoku} from "src/components/sudoku/Sudoku";
import {CellActionButton, UndoButton} from "src/components/sudoku/SudokuMenuControls";
import SudokuMenuNumbers from "src/components/sudoku/SudokuMenuNumbers";
import {canUndo, INITIAL_CREATE_NEW_SUDOKU_STATE, SudokuProvider, useSudoku} from "src/context/SudokuContext";
import {solve} from "src/lib/engine/solverAC3";
import {CellCoordinates, SimpleSudoku} from "src/lib/engine/types";
import {cellsToSimpleSudoku} from "src/lib/engine/utility";
import {useSudokuUniqueWorker} from "src/utils/useSudokuUniqueWorker";
import {useBoardShortcuts} from "./shortcuts/useBoardShortcuts";

const SHORTCUT_SCOPE = "new-sudoku";

const noop = () => {};

const NewSudokuInner = ({saveSudoku}: {saveSudoku: (sudoku: SimpleSudoku) => Promise<void>}) => {
  const {state: sudokuState, setNumber, clearCell, undo, redo} = useSudoku();
  const [activeCell, setActiveCell] = React.useState<CellCoordinates | undefined>(undefined);
  const {current: rawCells} = sudokuState;
  const currentSudoku = React.useMemo(
    () =>
      rawCells.map((cell) => ({
        ...cell,
        initial: cell.number !== 0,
      })),
    [rawCells],
  );
  const simpleSudoku = React.useMemo(() => cellsToSimpleSudoku(currentSudoku), [currentSudoku]);

  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const {checkUniqueness, isChecking} = useSudokuUniqueWorker();

  useBoardShortcuts({
    scope: SHORTCUT_SCOPE,
    activateScope: true,
    sudoku: currentSudoku,
    activeCell,
    selectCell: setActiveCell,
    onNumber: (cell, number) => setNumber(cell, number),
    onClear: (cell) => clearCell(cell),
    undo,
    redo,
  });

  const saveSudokuLocal = async () => {
    setIsSaving(true);
    setErrors([]);
    try {
      const solvedSudoku = solve(simpleSudoku);
      if (solvedSudoku.sudoku === null) {
        setErrors(["This sudoku is not solvable."]);
        return;
      }

      const {isUnique, error} = await checkUniqueness(simpleSudoku);
      if (error) {
        setErrors([`Error checking uniqueness: ${error}`]);
        return;
      }
      if (!isUnique) {
        setErrors(["This sudoku is not unique. It has multiple solutions."]);
        return;
      }
      await saveSudoku(simpleSudoku);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <main>
        <Sudoku
          sudoku={currentSudoku}
          showHints={false}
          showWrongEntries={false}
          showConflicts={true}
          shouldShowMenu={false}
          setNumber={setNumber}
          clearCell={clearCell}
          setNotes={noop}
          notesMode={false}
          showMenu={noop}
          hideMenu={noop}
          activeCell={activeCell}
          selectCell={setActiveCell}
        />
      </main>
      <div className="flex flex-col gap-4">
        <SudokuMenuNumbers
          notesMode={false}
          showOccurrences={false}
          activeCell={activeCell}
          sudoku={currentSudoku}
          showHints={false}
          setNumber={setNumber}
          setNotes={noop}
        />
        <div className="grid w-full grid-cols-2 gap-2">
          <UndoButton canUndo={canUndo(sudokuState)} undo={undo} />
          <CellActionButton label="erase_btn" cell={activeCell} onClick={clearCell} />
        </div>
        <div>
          <Button
            disabled={isSaving || isChecking}
            className="bg-teal-600 text-white dark:bg-teal-600"
            onClick={saveSudokuLocal}
          >
            {isChecking ? "Checking uniqueness..." : isSaving ? "Saving..." : "Save sudoku"}
          </Button>
          {errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc rounded-sm bg-red-800 p-2 pl-4 text-red-200">
              {errors.map((error) => (
                <li className="text-red-200" key={error}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const NewSudoku = ({saveSudoku}: {saveSudoku: (sudoku: SimpleSudoku) => Promise<void>}) => (
  <div>
    <SudokuProvider initialState={INITIAL_CREATE_NEW_SUDOKU_STATE}>
      <NewSudokuInner saveSudoku={saveSudoku} />
    </SudokuProvider>
  </div>
);

export default NewSudoku;
