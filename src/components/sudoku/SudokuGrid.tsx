import * as React from "react";
import {Bounds} from "src/components/sudoku/types";
import clsx from "clsx";

const GRID_LINE_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const GridLineX = ({
  top,
  width,
  makeBold,
  thin = false,
}: {
  top: number;
  width: number;
  makeBold: boolean;
  thin?: boolean;
}) => (
  <div
    style={{
      width: `${width}%`,
      top: `${top}%`,
      height: thin ? 1 : makeBold ? 2 : 1,
    }}
    className={clsx("absolute left-0 z-10 -translate-y-1/2", {
      "bg-grid-box": makeBold,
      "bg-grid-line": !makeBold,
    })}
  />
);

export const GridLineY = ({
  left,
  height,
  makeBold,
  thin = false,
}: {
  left: number;
  height: number;
  makeBold: boolean;
  thin?: boolean;
}) => (
  <div
    style={{
      height: `${height}%`,
      left: `${left}%`,
      width: thin ? 1 : makeBold ? 2 : 1,
    }}
    className={clsx("absolute top-0 z-10 -translate-x-1/2", {
      "bg-grid-box": makeBold,
      "bg-grid-line": !makeBold,
    })}
  />
);

export const SudokuGridLines = React.memo(
  ({
    width,
    height,
    hideOuter = false,
    thin = false,
  }: {
    width: number;
    height: number;
    hideOuter?: boolean;
    thin?: boolean;
  }) => (
    <div>
      {GRID_LINE_INDICES.map((i) => {
        if (hideOuter && (i === 0 || i === 9)) {
          return null;
        }
        const makeBold = i === 3 || i === 6;
        return (
          <React.Fragment key={i}>
            <GridLineX makeBold={makeBold} thin={thin} width={width} top={(i * height) / 9} />
            <GridLineY makeBold={makeBold} thin={thin} height={height} left={(i * width) / 9} />
          </React.Fragment>
        );
      })}
    </div>
  ),
);

export const CellNote = ({left, top, children}: {left: number; top: number; children: React.ReactNode}) => (
  <div
    style={{top: `${top}%`, left: `${left}%`}}
    className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-note-text sm:text-sm"
  >
    {children}
  </div>
);

export const CellNoteContainer = ({
  initial,
  bounds,
  children,
  testId,
}: {
  initial: boolean;
  bounds: Bounds;
  children: React.ReactNode;
  testId?: string;
}) => (
  <div
    data-testid={testId}
    style={{
      width: `${bounds.width}%`,
      height: `${bounds.height}%`,
      top: `${bounds.top}%`,
      left: `${bounds.left}%`,
    }}
    className={clsx("pointer-events-none absolute", {
      "font-bold": initial,
    })}
  >
    {children}
  </div>
);

export const GridCell = ({
  conflict,
  highlight,
  highlightNumber,
  bounds,
  active,
  notesMode,
  initial,
  number,
  testId,
  ariaLabel,
  onClick,
  onRightClick,
}: {
  conflict: boolean;
  highlight: boolean;
  highlightNumber: boolean;
  bounds: Bounds;
  active: boolean;
  notesMode: boolean;
  initial: boolean;
  number: number;
  testId?: string;
  ariaLabel?: string;
  onClick: () => void;
  onRightClick: () => void;
}) => {
  let backgroundColor = "bg-board-bg";
  if (highlight) {
    backgroundColor = "bg-cell-highlight";
  }
  if (highlightNumber) {
    backgroundColor = "bg-cell-match";
  }
  if (conflict) {
    backgroundColor = "bg-cell-conflict";
  }

  let borderColor = "border-transparent";
  if (active) {
    borderColor = notesMode ? "border-note" : "border-accent";
  }

  const dimensions = {
    width: `${bounds.width}%`,
    height: `${bounds.height}%`,
    top: `${bounds.top}%`,
    left: `${bounds.left}%`,
  };

  return (
    <>
      <div
        aria-label={ariaLabel}
        data-cell-active={active ? "true" : "false"}
        data-cell-conflict={conflict ? "true" : "false"}
        data-cell-initial={initial ? "true" : "false"}
        data-cell-notes-mode={notesMode ? "true" : "false"}
        data-cell-value={number === 0 ? "" : number}
        data-testid={testId}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRightClick();
        }}
        style={dimensions}
        className={clsx("absolute z-20 cursor-pointer border-2 hover:bg-ink/[0.04]", borderColor)}
      />
      <div style={dimensions} className={clsx("absolute z-0 transition-colors duration-0", backgroundColor)} />
    </>
  );
};

export const GridCellNumber = ({
  initial,
  highlight,
  left,
  top,
  children,
  testId,
  conflict,
}: {
  initial: boolean;
  highlight: boolean;
  conflict: boolean;
  left: number;
  top: number;
  children: React.ReactNode;
  testId?: string;
}) => (
  <div
    data-testid={testId}
    style={{
      left: `${left}%`,
      top: `${top}%`,
    }}
    className={clsx("pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 text-lg font-bold", {
      "text-digit-given": initial && !(highlight && !conflict),
      "text-digit-match": highlight && !conflict,
      "text-digit-user": !initial && !highlight && !conflict,
      "text-digit-conflict": conflict && !initial,
    })}
  >
    {children}
  </div>
);
