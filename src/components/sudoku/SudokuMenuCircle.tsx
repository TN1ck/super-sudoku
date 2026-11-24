import * as React from "react";
import {SUDOKU_NUMBERS} from "src/lib/engine/utility";
import {Cell} from "src/lib/engine/types";
import {Bounds} from "src/components/sudoku/types";
import SudokuGame from "src/lib/game/SudokuGame";
import colors from "tailwindcss/colors";

export const MenuContainer = ({bounds, children}: {bounds: Bounds; children: React.ReactNode}) => (
  <div
    className="absolute"
    style={{
      width: `${bounds.width}%`,
      height: `${bounds.height}%`,
      top: `${bounds.top}%`,
      left: `${bounds.left}%`,
    }}
  >
    {children}
  </div>
);

export const MenuWrapper = ({children}: {children: React.ReactNode}) => (
  <div
    className="relative z-50"
    style={{
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }}
  >
    {children}
  </div>
);

const TAU = Math.PI * 2;
const CIRCLE_RADIUS = 45;
const RAD_PER_STEP = TAU / SUDOKU_NUMBERS.length;

const NUMBER_SLICE_COLORS = [colors.teal[500], colors.teal[600], colors.teal[400]];
const NOTE_SLICE_COLORS = [colors.sky[500], colors.sky[600], colors.sky[400]];

const MenuCirclePart = React.memo(
  ({
    radius,
    isActive,
    onClick,
    minRad,
    maxRad,
    children,
    stroke,
  }: {
    radius: number;
    isActive: boolean;
    onClick: React.MouseEventHandler<SVGCircleElement>;
    minRad: number;
    maxRad: number;
    children?: React.ReactNode;
    stroke: string;
  }) => {
    const yOffset = 7;
    const textRadius = radius + 8;
    const circumCircle = TAU * radius;
    const step = Math.abs(maxRad - minRad);

    const center = radius * 2;
    const x = textRadius * Math.cos(minRad + step * 0.5) + center;
    const y = textRadius * Math.sin(minRad + step * 0.5) + center + yOffset;

    const strokeDashoffset = -((minRad / TAU) * circumCircle) % circumCircle;
    const strokeDasharray = `${(step / TAU) * circumCircle} ${circumCircle}`;

    return (
      <g>
        <circle
          className={`hover:fill-opacity-90 stroke-[50px] opacity-75 hover:cursor-pointer hover:stroke-[60px] ${
            isActive ? "fill-opacity-90 cursor-pointer stroke-[60px]" : ""
          }`}
          r={radius}
          cx={center}
          cy={center}
          fill="none"
          onClick={onClick}
          style={{
            strokeDashoffset,
            strokeDasharray,
            stroke,
          }}
        />
        <text
          x={x}
          y={y}
          style={{
            fill: "white",
            textAnchor: "middle",
            pointerEvents: "none",
          }}
        >
          {children}
        </text>
      </g>
    );
  },
);

const MenuCircle: React.FC<{
  cell: Cell;
  notesMode: boolean;
  showHints: boolean;
  setNumber: (cell: Cell, number: number) => void;
  setNotes: (cell: Cell, notes: number[]) => void;
  clearCell: (cell: Cell) => void;
  sudoku: Cell[];
}> = ({cell, notesMode, showHints, setNumber, setNotes, clearCell, sudoku}) => {
  const notes = SudokuGame.visibleNotes(cell, sudoku, showHints);
  const sliceColors = notesMode ? NOTE_SLICE_COLORS : NUMBER_SLICE_COLORS;

  return (
    <svg
      className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform select-none md:block"
      data-testid="sudoku-menu-circle"
      style={{
        height: CIRCLE_RADIUS * 4,
        width: CIRCLE_RADIUS * 4,
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
      }}
    >
      {SUDOKU_NUMBERS.map((number, i) => {
        const currentMinRad = RAD_PER_STEP * (i + 1);
        const currentMaxRad = currentMinRad + RAD_PER_STEP;
        const isActive = notesMode ? notes.includes(number) : number === cell.number;
        const stroke = sliceColors[i % sliceColors.length];

        return (
          <MenuCirclePart
            key={number}
            radius={CIRCLE_RADIUS}
            isActive={isActive}
            minRad={currentMinRad}
            stroke={stroke}
            maxRad={currentMaxRad}
            onClick={(e) => {
              if (notesMode) {
                e.preventDefault();
                e.stopPropagation();
                setNotes(cell, SudokuGame.toggleNote(cell, notes, number));
              } else if (number === cell.number) {
                clearCell(cell);
              } else {
                setNumber(cell, number);
              }
            }}
          >
            {number}
          </MenuCirclePart>
        );
      })}
    </svg>
  );
};

export default MenuCircle;
