import * as React from "react";
import hotkeys from "hotkeys-js";
import {Cell, CellCoordinates} from "src/lib/engine/types";
import {findCell, SUDOKU_COORDINATES, SUDOKU_NUMBERS} from "src/lib/engine/utility";

interface UseBoardShortcutsOptions {
  scope: string;
  activateScope?: boolean;
  sudoku: Cell[];
  activeCell: CellCoordinates | undefined;
  selectCell: (cell: CellCoordinates) => void;
  onNumber: (cell: Cell, number: number) => void;
  onClear: (cell: Cell) => void;
  undo: () => void;
  redo: () => void;
  registerExtra?: (scope: string) => void;
}

const MIN_COORDINATE = SUDOKU_COORDINATES[0];
const MAX_COORDINATE = SUDOKU_COORDINATES[SUDOKU_COORDINATES.length - 1];

export function useBoardShortcuts(options: UseBoardShortcutsOptions) {
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  const {scope, activateScope = false} = options;

  React.useEffect(() => {
    const moveSelection = (dx: number, dy: number) => {
      const {activeCell, sudoku, selectCell} = optionsRef.current;
      if (activeCell === undefined) {
        if (sudoku.length > 0) {
          selectCell(sudoku[0]);
        }
        return false;
      }

      const nextX = Math.min(Math.max(activeCell.x + dx, MIN_COORDINATE), MAX_COORDINATE);
      const nextY = Math.min(Math.max(activeCell.y + dy, MIN_COORDINATE), MAX_COORDINATE);
      const nextCell = findCell(sudoku, {x: nextX, y: nextY});
      if (nextCell) {
        selectCell(nextCell);
      }
      return false;
    };

    hotkeys("up", scope, () => moveSelection(0, -1));
    hotkeys("down", scope, () => moveSelection(0, 1));
    hotkeys("right", scope, () => moveSelection(1, 0));
    hotkeys("left", scope, () => moveSelection(-1, 0));

    for (const n of SUDOKU_NUMBERS) {
      hotkeys(`${n},num_${n}`, scope, () => {
        const {activeCell, sudoku, onNumber} = optionsRef.current;
        const cell = findCell(sudoku, activeCell);
        if (cell) {
          onNumber(cell, n);
        }
      });
    }

    hotkeys("backspace,del,num_subtract", scope, () => {
      const {activeCell, sudoku, onClear} = optionsRef.current;
      const cell = findCell(sudoku, activeCell);
      if (cell) {
        onClear(cell);
      }
      return false;
    });

    hotkeys("ctrl+z,cmd+z", scope, () => {
      optionsRef.current.undo();
      return false;
    });

    hotkeys("ctrl+y,cmd+y,ctrl+shift+z,cmd+shift+z", scope, () => {
      optionsRef.current.redo();
      return false;
    });

    optionsRef.current.registerExtra?.(scope);

    if (activateScope) {
      hotkeys.setScope(scope);
    }

    return () => {
      hotkeys.deleteScope(scope);
    };
  }, [scope, activateScope]);
}
