import * as React from "react";
import styled, {css} from "styled-components";
import THEME from "src/theme";
import {Bounds} from "src/utils/types";
import clsx from "clsx";

export const SudokuContainer = styled.div.attrs({
  className: "absolute h-full w-full rounded-sm bg-white",
})``;

export const GridLineX = ({top, width, makeBold}: {top: number; width: number; makeBold: boolean}) => {
  return (
    <div
      style={{
        width: `${width}%`,
        top: `${top}%`,
        height: makeBold ? 2 : 1,
      }}
      className={clsx("absolute left-0 -translate-y-1/2", {
        "z-10 bg-gray-300": makeBold,
        "bg-gray-200": !makeBold,
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
        "z-10 bg-gray-300": makeBold,
        "bg-gray-200": !makeBold,
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
  return (
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
      style={{
        width: `${bounds.width}%`,
        height: `${bounds.height}%`,
        top: `${bounds.top}%`,
        left: `${bounds.left}%`,
      }}
      className={clsx(
        "absolute z-0 bg-opacity-50 transition-colors duration-0 hover:z-20 hover:border-2 hover:bg-opacity-50",
        {
          "hover:border-sky-400 hover:bg-gray-300": notesMode,
          "hover:border-teal-400 hover:bg-gray-300": !notesMode,
          "duration-300 bg-gray-400": highlightNumber && !conflict && !active,
          "duration-300 bg-gray-300": highlight && !conflict && !active,
          "z-20 border-2 border-sky-400 bg-gray-300": active && notesMode,
          "z-20 border-2 border-teal-400 bg-gray-300": active && !notesMode,
          "z-20 border-2 border-red-400 bg-red-300": active && conflict,
          "duration-300 bg-red-300 hover:border-red-400 hover:bg-red-300": conflict,
        },
      )}
    />
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
        "text-black": initial,
        "text-amber-600": highlight && !conflict && !conflict,
        "text-teal-600": !initial && !highlight && !conflict,
        "text-red-600": conflict && !initial,
      })}
    >
      {children}
    </div>
  );
};
