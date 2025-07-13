import * as React from "react";

import SudokuMenuCircle, {MenuWrapper, MenuContainer} from "./SudokuMenuCircle";
import {
  GridLineX,
  GridCell,
  GridLineY,
  GridCellNumber,
  CellNote,
  CellNoteContainer,
} from "src/components/sudoku/SudokuGrid";
import SudokuGame from "src/lib/game/SudokuGame";
import {Bounds} from "src/components/sudoku/types";
import {Cell, CellCoordinates} from "src/lib/engine/types";
import flatten from "lodash-es/flatten";
import {useElementWidth} from "src/utils/hooks";

const SudokuGrid = React.memo(
  ({width, height, hideLeftRight = false}: {width: number; height: number; hideLeftRight?: boolean}) => {
    return (
      <div>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const hide = [0, 9].includes(i);
          if (hideLeftRight && hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineX makeBold={makeBold} key={i} width={width} top={(i * height) / 9} />;
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const hide = [0, 9].includes(i);
          if (hideLeftRight && hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineY makeBold={makeBold} key={i} height={height} left={(i * height) / 9} />;
        })}
      </div>
    );
  },
);

const SudokuCell = React.memo(
  ({
    number,
    active,
    highlight,
    bounds,
    onClick,
    onRightClick,
    left,
    top,
    initial,
    notes,
    notesMode,
    conflict,
    highlightNumber,
  }: {
    number: number;
    active: boolean;
    highlightNumber: boolean;
    highlight: boolean;
    conflict: boolean;
    bounds: Bounds;
    onClick: () => void;
    onRightClick: () => void;
    top: number;
    left: number;
    initial: boolean;
    notes: number[];
    notesMode: boolean;
  }) => {
    return (
      <div>
        <GridCell
          notesMode={notesMode}
          active={active}
          conflict={conflict}
          highlight={highlight}
          highlightNumber={highlightNumber}
          bounds={bounds}
          onClick={onClick}
          onRightClick={onRightClick}
        />
        <GridCellNumber left={left} top={top} initial={initial} highlight={highlightNumber} conflict={conflict}>
          {number !== 0 ? number : ""}
        </GridCellNumber>
        <CellNoteContainer initial={initial} bounds={bounds}>
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
  notesMode: boolean;
  showMenu: (showNotes?: boolean) => void;
  hideMenu: () => void;
  selectCell: (cellCoordinates: CellCoordinates) => void;
  setNumber: (cell: Cell, number: number) => void;
  setNotes: (cell: Cell, notes: number[]) => void;
  clearNumber: (cell: Cell) => void;
  children: React.ReactNode;
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
  clearNumber,
  children,
  showConflicts,
  showWrongEntries,
  notesMode,
  shouldShowMenu,
}) => {
  const height = 100;
  const width = 100;

  const xSection = height / 9;
  const ySection = width / 9;

  const activeCell = passedActiveCell && sudoku.find((c) => c.x === passedActiveCell.x && c.y === passedActiveCell.y);
  const selectionPosition = {
    x: (activeCell && activeCell.x) || 0,
    y: (activeCell && activeCell.y) || 0,
  };

  const positionedCells = SudokuGame.positionedCells(sudoku, width, height);
  const conflicting = SudokuGame.conflictingFields(sudoku);
  const uniquePaths = SudokuGame.uniquePaths(
    flatten(
      conflicting.map((c) => {
        return SudokuGame.getPathsFromConflicting(c, sudoku);
      }),
    ),
  );

  const pathCells = flatten(
    uniquePaths.map((p) => {
      return SudokuGame.getPathBetweenCell(p.from, p.to);
    }),
  );

  const friendsOfActiveCell = activeCell ? SudokuGame.sameSquareColumnRow(activeCell, sudoku) : [];

  const sudokuContainerRef = React.useRef(null);
  const containerWidth = useElementWidth(sudokuContainerRef);

  React.useEffect(() => {
    const handleClick = () => {
      if (activeCell !== null) {
        hideMenu();
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [activeCell, hideMenu]);

  return (
    <div className="relative" ref={sudokuContainerRef} style={{height: containerWidth}}>
      {children}
      <div className="absolute h-full w-full rounded-sm">
        <SudokuGrid width={width} height={height} hideLeftRight />
        {sudoku.map((c, i) => {
          const onClick = () => {
            selectCell(c);
            if (!c.initial) {
              showMenu();
            }
          };
          const onRightClick = () => {
            selectCell(c);
            if (!c.initial) {
              showMenu(true);
            }
          };
          const position = positionedCells[i];
          const conflicted = conflicting[i];

          const notes = showHints && c.notes.length === 0 ? conflicted.possibilities : c.notes;

          const inConflictPath =
            showConflicts &&
            pathCells.some((d) => {
              return d.x === c.x && d.y === c.y;
            });

          const bounds: Bounds = {
            width: xSection,
            height: ySection,
            left: xSection * c.x,
            top: ySection * c.y,
          };

          const isActive = activeCell ? c.x === activeCell.x && c.y === activeCell.y : false;
          const highlight = friendsOfActiveCell.some((cc) => {
            return cc.x === c.x && cc.y === c.y;
          });
          const isWrong = showWrongEntries && (c.number === 0 ? false : c.solution !== c.number);
          const highlightNumber = activeCell && c.number !== 0 ? activeCell.number === c.number : false;

          return (
            <SudokuCell
              key={i}
              active={isActive}
              highlight={highlight}
              highlightNumber={highlightNumber && !isActive}
              conflict={inConflictPath || isWrong}
              bounds={bounds}
              onClick={onClick}
              onRightClick={onRightClick}
              left={position.x}
              top={position.y}
              notes={notes}
              number={c.number}
              initial={c.initial}
              notesMode={notesMode}
            />
          );
        })}
        {activeCell && shouldShowMenu ? (
          <MenuContainer
            bounds={{
              top: ySection * selectionPosition.y,
              left: xSection * selectionPosition.x,
              height: ySection,
              width: xSection,
            }}
          >
            <MenuWrapper>
              <SudokuMenuCircle
                cell={activeCell}
                notesMode={notesMode}
                showHints={showHints}
                setNumber={setNumber}
                setNotes={setNotes}
                clearNumber={clearNumber}
                sudoku={sudoku}
                showMenu={showMenu}
              />
            </MenuWrapper>
          </MenuContainer>
        ) : null}
      </div>
    </div>
  );
};
