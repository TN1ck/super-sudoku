import * as React from "react";

import SudokuMenuCircle, {MenuWrapper, MenuContainer} from "./SudokuMenuCircle";
import {
  SudokuGridLines,
  GridCell,
  GridCellNumber,
  CellNote,
  CellNoteContainer,
} from "src/components/sudoku/SudokuGrid";
import {findCell, sharesUnit} from "src/lib/engine/utility";
import SudokuGame from "src/lib/game/SudokuGame";
import {Bounds} from "src/components/sudoku/types";
import {Cell, CellCoordinates} from "src/lib/engine/types";

const BOARD_SIZE = 100;
const CELL_SECTION = BOARD_SIZE / 9;

const SudokuCell = React.memo(
  ({
    number,
    active,
    highlight,
    onSelect,
    onContextMenu,
    initial,
    notes,
    notesMode,
    conflict,
    highlightNumber,
    x,
    y,
  }: {
    number: number;
    active: boolean;
    highlightNumber: boolean;
    highlight: boolean;
    conflict: boolean;
    onSelect: (x: number, y: number, initial: boolean) => void;
    onContextMenu: (x: number, y: number, initial: boolean) => void;
    initial: boolean;
    notes: number[];
    notesMode: boolean;
    x: number;
    y: number;
  }) => {
    const row = y + 1;
    const column = x + 1;

    const bounds: Bounds = {
      width: CELL_SECTION,
      height: CELL_SECTION,
      left: CELL_SECTION * x,
      top: CELL_SECTION * y,
    };

    const handleClick = React.useCallback(() => onSelect(x, y, initial), [onSelect, x, y, initial]);
    const handleRightClick = React.useCallback(() => onContextMenu(x, y, initial), [onContextMenu, x, y, initial]);

    return (
      <div>
        <GridCell
          ariaLabel={`${initial ? "Given" : "Editable"} cell row ${row} column ${column}${
            number === 0 ? " empty" : ` value ${number}`
          }`}
          notesMode={notesMode}
          active={active}
          conflict={conflict}
          highlight={highlight}
          highlightNumber={highlightNumber}
          bounds={bounds}
          initial={initial}
          number={number}
          onClick={handleClick}
          onRightClick={handleRightClick}
          testId={`sudoku-cell-${x}-${y}`}
        />
        <GridCellNumber
          left={CELL_SECTION * (x + 0.5)}
          top={CELL_SECTION * (y + 0.5)}
          initial={initial}
          highlight={highlightNumber}
          conflict={conflict}
          testId={`sudoku-cell-value-${x}-${y}`}
        >
          {number !== 0 ? number : ""}
        </GridCellNumber>
        <CellNoteContainer initial={initial} bounds={bounds} testId={`sudoku-cell-notes-${x}-${y}`}>
          {initial || number
            ? null
            : notes.map((n) => {
                const notePosition = SudokuGame.getNotePosition(n);
                return (
                  <CellNote key={n} left={notePosition.x} top={notePosition.y}>
                    {n !== 0 ? n : ""}
                  </CellNote>
                );
              })}
        </CellNoteContainer>
      </div>
    );
  },
);

interface SudokuProps {
  activeCell?: CellCoordinates;
  sudoku: Cell[];
  showHints: boolean;
  showWrongEntries: boolean;
  showConflicts: boolean;
  shouldShowMenu: boolean;
  showNotesMenu?: boolean;
  notesMode: boolean;
  showMenu: (showNotes?: boolean) => void;
  hideMenu: () => void;
  selectCell: (cellCoordinates: CellCoordinates) => void;
  setNumber: (cell: Cell, number: number) => void;
  setNotes: (cell: Cell, notes: number[]) => void;
  clearCell: (cell: Cell) => void;
  children?: React.ReactNode;
}

export const Sudoku: React.FC<SudokuProps> = ({
  sudoku,
  showHints,
  activeCell: passedActiveCell,
  hideMenu,
  showMenu,
  selectCell,
  setNumber,
  setNotes,
  clearCell,
  children,
  showConflicts,
  showWrongEntries,
  notesMode,
  shouldShowMenu,
  showNotesMenu = false,
}) => {
  const activeCell = findCell(sudoku, passedActiveCell);

  const conflictCellIndices = React.useMemo(() => {
    if (!showConflicts) {
      return new Set<number>();
    }
    const indices = new Set<number>();
    for (const {from, to} of SudokuGame.conflictingPaths(sudoku)) {
      for (const cell of SudokuGame.getPathBetweenCell(from, to)) {
        indices.add(cell.y * 9 + cell.x);
      }
    }
    return indices;
  }, [showConflicts, sudoku]);

  const visibleNotesByCell = React.useMemo(
    () => sudoku.map((cell) => SudokuGame.visibleNotes(cell, sudoku, showHints)),
    [sudoku, showHints],
  );

  React.useEffect(() => {
    if (!shouldShowMenu) {
      return;
    }
    const handleClick = () => hideMenu();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [shouldShowMenu, hideMenu]);

  const handleSelectCell = React.useCallback(
    (x: number, y: number, initial: boolean) => {
      selectCell({x, y});
      if (initial) {
        hideMenu();
      } else {
        showMenu();
      }
    },
    [selectCell, showMenu, hideMenu],
  );

  const handleContextMenuCell = React.useCallback(
    (x: number, y: number, initial: boolean) => {
      selectCell({x, y});
      if (initial) {
        hideMenu();
      } else {
        showMenu(true);
      }
    },
    [selectCell, showMenu, hideMenu],
  );

  return (
    <div
      className="relative mx-auto aspect-square w-full md:max-w-[calc(100dvh-7rem)]"
      data-testid="sudoku-board"
    >
      {children}
      <div className="absolute h-full w-full rounded-sm">
        <SudokuGridLines width={BOARD_SIZE} height={BOARD_SIZE} hideOuter />
        {sudoku.map((c, index) => {
          const notes = visibleNotesByCell[index];
          const inConflictPath = conflictCellIndices.has(c.y * 9 + c.x);

          const isActive = activeCell ? c.x === activeCell.x && c.y === activeCell.y : false;
          const highlight = activeCell ? sharesUnit(activeCell, c) : false;
          const isWrong = showWrongEntries && c.number !== 0 && c.solution !== 0 && c.solution !== c.number;
          const highlightNumber = activeCell && c.number !== 0 ? activeCell.number === c.number : false;

          return (
            <SudokuCell
              key={`${c.x}-${c.y}`}
              active={isActive}
              highlight={highlight}
              highlightNumber={highlightNumber && !isActive}
              conflict={inConflictPath || isWrong}
              onSelect={handleSelectCell}
              onContextMenu={handleContextMenuCell}
              notes={notes}
              number={c.number}
              initial={c.initial}
              notesMode={notesMode}
              x={c.x}
              y={c.y}
            />
          );
        })}
        {activeCell && !activeCell.initial && shouldShowMenu ? (
          <MenuContainer
            bounds={{
              top: CELL_SECTION * activeCell.y,
              left: CELL_SECTION * activeCell.x,
              height: CELL_SECTION,
              width: CELL_SECTION,
            }}
          >
            <MenuWrapper>
              <SudokuMenuCircle
                cell={activeCell}
                notesMode={notesMode || showNotesMenu}
                showHints={showHints}
                setNumber={setNumber}
                setNotes={setNotes}
                clearCell={clearCell}
                sudoku={sudoku}
              />
            </MenuWrapper>
          </MenuContainer>
        ) : null}
      </div>
    </div>
  );
};
