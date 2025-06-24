import * as React from "react";
import {useGame} from "src/context/GameContext";
import {useSudoku} from "src/context/SudokuContext";
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
    <div className="menu-wrapper-mobile">{children}</div>
  </div>
);

const TAU = Math.PI * 2;

const MENU_COLORS = {
  menuColors: {
    normal: colors.teal[500],
    alternate: colors.teal[600],
    alternate2: colors.teal[400],
    noteNormal: colors.sky[500],
    noteAlternate: colors.sky[600],
    noteAlternate2: colors.sky[400],
  },
};

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
    onClick: (e: any) => void;
    minRad: number;
    maxRad: number;
    children?: React.ReactChild;
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

    const baseClasses = "stroke-[50px] opacity-75";
    const hoverClasses = "hover:stroke-[60px] hover:cursor-pointer hover:fill-opacity-90";
    const activeClasses = isActive ? "stroke-[60px] cursor-pointer fill-opacity-90" : "";

    return (
      <g>
        <circle
          className={`${baseClasses} ${hoverClasses} ${activeClasses}`}
          r={radius}
          cx={radius * 2}
          cy={radius * 2}
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
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {children}
        </text>
      </g>
    );
  },
);

interface MenuCircleProps {
  cell: Cell;
}

const MenuCircle: React.FC<MenuCircleProps> = ({cell}) => {
  const {state: gameState, showMenu} = useGame();
  const {state: sudokuState, setNumber, setNotes, clearNumber} = useSudoku();

  const {notesMode, showHints} = gameState;
  const sudoku = sudokuState.current;

  if (cell === null) {
    return null;
  }

  const circleRadius = 45;
  const minRad = 0;
  const maxRad = TAU;

  const usedRad = Math.abs(maxRad - minRad);
  const circumCircle = TAU * circleRadius;
  const radPerStep = usedRad / SUDOKU_NUMBERS.length;

  return (
    <svg
      className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none"
      style={{
        height: circleRadius * 4,
        width: circleRadius * 4,
        transform: `translate(-50%, -50%) rotate(${minRad}rad)`,
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
      }}
      onClick={() => showMenu()}
    >
      <circle
        r={circleRadius}
        cx={circleRadius * 2}
        cy={circleRadius * 2}
        style={{
          pointerEvents: "none",
          strokeDashoffset: 0,
          strokeDasharray: `${(usedRad / TAU) * circumCircle} ${circumCircle}`,
        }}
        fill="none"
        className={notesMode ? "ss_menu-circle-notes" : "ss_menu-circle"}
      />
      {SUDOKU_NUMBERS.map((number, i) => {
        const currentMinRad = minRad + radPerStep * (i + 1);
        const currentMaxRad = currentMinRad + radPerStep;
        let isActive = number === cell.number;

        const conflicting = SudokuGame.conflictingFields(sudoku);
        const userNotes = sudoku[cell.y * 9 + cell.x].notes;
        const conflictingCell = conflicting[cell.y * 9 + cell.x];
        const autoNotes = showHints ? conflictingCell.possibilities : [];
        const notesToUse = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;

        if (notesMode) {
          isActive = notesToUse.includes(number);
        }

        const colors = notesMode
          ? [
              MENU_COLORS.menuColors.noteNormal,
              MENU_COLORS.menuColors.noteAlternate,
              MENU_COLORS.menuColors.noteAlternate2,
            ]
          : [MENU_COLORS.menuColors.normal, MENU_COLORS.menuColors.alternate, MENU_COLORS.menuColors.alternate2];

        const stroke = colors[i % colors.length];

        return (
          <MenuCirclePart
            key={i}
            radius={circleRadius}
            isActive={isActive}
            minRad={currentMinRad}
            stroke={stroke}
            maxRad={currentMaxRad}
            onClick={(e) => {
              if (notesMode) {
                e.preventDefault();
                e.stopPropagation();
              }
              if (notesMode) {
                const newNotes = notesToUse.includes(number)
                  ? notesToUse.filter((note) => note !== number)
                  : [...userNotes, number];
                setNotes(cell, newNotes);
              } else {
                if (number === cell.number) {
                  clearNumber(cell);
                } else {
                  setNumber(cell, number);
                }
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
