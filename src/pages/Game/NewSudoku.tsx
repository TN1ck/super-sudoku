import hotkeys from "hotkeys-js";
import * as React from "react";
import {useMemo} from "react";
import Button from "src/components/Button";
import {Sudoku} from "src/components/sudoku/Sudoku";
import {EraseButton, UndoButton} from "src/components/sudoku/SudokuMenuControls";
import SudokuMenuNumbers from "src/components/sudoku/SudokuMenuNumbers";
import {
  emptyGrid,
  INITIAL_CREATE_NEW_SUDOKU_STATE,
  INITIAL_SUDOKU_STATE,
  SudokuProvider,
  useSudoku,
} from "src/context/SudokuContext";
import {Collection} from "src/lib/database/collections";
import {solve} from "src/lib/engine/solverAC3";
import {Cell, CellCoordinates, SimpleSudoku} from "src/lib/engine/types";
import {cellsToSimpleSudoku, stringifySudoku, SUDOKU_COORDINATES, SUDOKU_NUMBERS} from "src/lib/engine/utility";
import {useSudokuUniqueWorker} from "src/utils/useSudokuUniqueWorker";
import SudokuGame from "src/lib/game/SudokuGame";

const SHORTCUT_SCOPE = "new-sudoku";

const GridShortcuts: React.FC<{
  setNumber: (cell: CellCoordinates, number: number) => void;
  clearNumber: (cell: CellCoordinates) => void;
  undo: () => void;
  redo: () => void;
  sudoku: Cell[];
  activeCell: CellCoordinates | undefined;
  selectCell: (cell: CellCoordinates) => void;
}> = ({setNumber, clearNumber, undo, redo, sudoku, activeCell, selectCell}) => {
  const stateRef = React.useRef({
    activeCell,
    sudoku,
    selectCell,
    setNumber,
    clearNumber,
    undo,
    redo,
  });

  React.useEffect(() => {
    stateRef.current = {
      activeCell,
      sudoku,
      selectCell,
      setNumber,
      clearNumber,
      undo,
      redo,
    };
  });

  React.useEffect(() => {
    console.log("setting up hotkeys");
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

    console.log("set up hotkeys");

    hotkeys("up", SHORTCUT_SCOPE, () => {
      console.log("up");
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

    hotkeys("down", SHORTCUT_SCOPE, () => {
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

    hotkeys("right", SHORTCUT_SCOPE, () => {
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

    hotkeys("left", SHORTCUT_SCOPE, () => {
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
      hotkeys(keys, SHORTCUT_SCOPE, () => {
        const {activeCell, setNumber} = stateRef.current;
        if (activeCell) {
          setNumber(activeCell, n);
        }
      });
    });

    hotkeys("backspace,num_subtract", SHORTCUT_SCOPE, () => {
      const {activeCell, clearNumber} = stateRef.current;
      if (activeCell) {
        clearNumber(activeCell);
      }
      return false;
    });

    hotkeys("ctrl+z,cmd+z", SHORTCUT_SCOPE, () => {
      stateRef.current.undo();
      return false;
    });

    hotkeys("ctrl+y,cmd+y", SHORTCUT_SCOPE, () => {
      stateRef.current.redo();
      return false;
    });

    hotkeys.setScope(SHORTCUT_SCOPE);

    return () => {
      hotkeys.deleteScope(SHORTCUT_SCOPE);
    };
  }, []); // Empty dependency array - shortcuts created once

  return null;
};

const NewSudokuInner = ({saveSudoku}: {saveSudoku: (sudoku: SimpleSudoku) => Promise<void>}) => {
  const {state: sudokuState, setNumber, clearNumber, undo, redo} = useSudoku();
  const canUndo = sudokuState.history.length > 1;
  const [activeCell, setActiveCell] = React.useState<CellCoordinates | undefined>(undefined);
  const currentSudoku = sudokuState.current.map((cell) => ({
    ...cell,
    number: cell.number,
    initial: cell.number !== 0,
  }));
  const simpleSudoku = cellsToSimpleSudoku(currentSudoku);

  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const {checkUniqueness, isChecking} = useSudokuUniqueWorker();

  const saveSudokuLocal = async () => {
    setIsSaving(true);
    setErrors([]);
    const solvedSudoku = solve(simpleSudoku);
    if (solvedSudoku.sudoku === null) {
      setErrors(["This sudoku is not solvable."]);
      setIsSaving(false);
      return;
    }

    const {isUnique, error} = await checkUniqueness(simpleSudoku);
    if (error) {
      setErrors([`Error checking uniqueness: ${error}`]);
      setIsSaving(false);
      return;
    }
    if (!isUnique) {
      setErrors(["This sudoku is not unique. It has multiple solutions."]);
      setIsSaving(false);
      return;
    }
    await saveSudoku(simpleSudoku);
    setIsSaving(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <GridShortcuts
        setNumber={setNumber}
        clearNumber={clearNumber}
        undo={undo}
        redo={redo}
        sudoku={currentSudoku}
        activeCell={activeCell}
        selectCell={setActiveCell}
      />
      <main>
        <Sudoku
          sudoku={currentSudoku}
          showHints={false}
          showWrongEntries={false}
          showConflicts={true}
          shouldShowMenu={false}
          setNumber={setNumber}
          clearNumber={clearNumber}
          setNotes={() => {}}
          notesMode={false}
          showMenu={() => {}}
          hideMenu={() => {}}
          activeCell={activeCell}
          selectCell={setActiveCell}
          children={<></>}
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
          setNotes={() => {}}
        />
        <div className="grid w-full grid-cols-4 gap-2">
          <UndoButton canUndo={canUndo} undo={undo} />
          <EraseButton activeCellCoordinates={activeCell} clearCell={clearNumber} />
        </div>
        <div>
          <Button
            disabled={isSaving || isChecking}
            className="bg-teal-600 dark:bg-teal-600 text-white"
            onClick={saveSudokuLocal}
          >
            {isSaving ? "Saving..." : isChecking ? "Checking uniqueness..." : "Save sudoku"}
          </Button>
          {errors.length > 0 && (
            <ul className="text-red-200 mt-2 bg-red-800 p-2 rounded-sm list-disc list-inside pl-4">
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

const NewSudoku = ({
  collection,
  saveSudoku,
}: {
  collection: Collection;
  saveSudoku: (sudoku: SimpleSudoku) => Promise<void>;
}) => {
  return (
    <div>
      <SudokuProvider initialState={INITIAL_CREATE_NEW_SUDOKU_STATE}>
        <NewSudokuInner saveSudoku={saveSudoku} />
      </SudokuProvider>
    </div>
  );
};

export default NewSudoku;
