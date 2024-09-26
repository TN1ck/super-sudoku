import * as React from "react";
import {Bounds} from "src/utils/types";
import clsx from "clsx";

export const GridLineX = ({top, width, makeBold}: {top: number; width: number; makeBold: boolean}) => {
  return (
    <div
      style={{
        width: `${width}%`,
        top: `${top}%`,
        height: makeBold ? 2 : 1,
      }}
      className={clsx("absolute left-0 -translate-y-1/2", {
        "z-10 bg-gray-400 dark:bg-gray-500": makeBold,
        "z-10 bg-gray-300 dark:bg-gray-600": !makeBold,
      })}
    />
  );
};

export const GridLineY = ({left, height, makeBold}: {left: number; height: number; makeBold: boolean}) => {
  return (
    <div
      style={{
        height: `${height}%`,
        left: `${left}%`,
        width: makeBold ? 2 : 1,
      }}
      className={clsx("absolute left-0 -translate-x-1/2", {
        "z-10 bg-gray-400 dark:bg-gray-500": makeBold,
        "z-10 bg-gray-300 dark:bg-gray-600": !makeBold,
      })}
    />
  );
};

export const CellNote = ({left, top, children}: {left: number; top: number; children: React.ReactNode}) => {
  return (
    <div
      style={{top: `${top}%`, left: `${left}%`}}
      className="absolute -translate-x-1/2 -translate-y-1/2 text-xs text-sky-400 sm:text-sm"
    >
      {children}
    </div>
  );
};

export const CellNoteContainer = ({
  initial,
  bounds,
  children,
}: {
  initial: boolean;
  bounds: Bounds;
  children: React.ReactNode;
}) => {
  return (
    <div
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
};

export const GridCell = ({
  conflict,
  highlight,
  highlightNumber,
  bounds,
  active,
  notesMode,
  onClick,
  onRightClick,
}: {
  conflict: boolean;
  highlight: boolean;
  highlightNumber: boolean;
  bounds: Bounds;
  active: boolean;
  notesMode: boolean;
  onClick: () => void;
  onRightClick: () => void;
}) => {
  let backgroundColor = "bg-white dark:bg-gray-800";
  if (highlight) {
    backgroundColor = "bg-gray-300 dark:bg-gray-700";
  }
  if (highlightNumber) {
    backgroundColor = "bg-gray-400 dark:bg-gray-600";
  }
  if (conflict) {
    backgroundColor = "bg-red-300 dark:bg-red-900";
  }

  let borderColor = "border-transparent";
  if (active) {
    borderColor = "border-teal-400 dark:border-teal-600";
    if (notesMode) {
      borderColor = "border-sky-400 dark:border-sky-600";
    }
  }

  const dimensions = {
    width: `${bounds.width}%`,
    height: `${bounds.height}%`,
    top: `${bounds.top}%`,
    left: `${bounds.left}%`,
  };

  return (
    <>
      <div style={dimensions} className={clsx("absolute z-20 border-2", borderColor)} />
      <div
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
        className={clsx("absolute z-0 bg-opacity-50 transition-colors duration-0 hover:bg-opacity-50", backgroundColor)}
      />
    </>
  );
};

export const GridCellNumber = ({
  initial,
  highlight,
  left,
  top,
  children,
  // TODO: distinguish between wrong and conflicted.
  conflict,
}: {
  initial: boolean;
  highlight: boolean;
  conflict: boolean;
  left: number;
  top: number;
  children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        left: `${left}%`,
        top: `${top}%`,
      }}
      className={clsx("pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 text-lg font-bold", {
        "text-black dark:text-white": initial,
        "text-amber-600": highlight && !conflict,
        "text-teal-600": !initial && !highlight && !conflict,
        "text-red-600 dark:text-red-300": conflict && !initial,
      })}
    >
      {children}
    </div>
  );
};
