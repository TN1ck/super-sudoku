import * as React from "react";
import {connect, ConnectedProps} from "react-redux";
import {setNumber, clearNumber, setNotes} from "src/state/sudoku";
import {SUDOKU_NUMBERS} from "src/engine/utility";
import {Cell} from "src/engine/types";
import THEME from "src/theme";
import {showMenu} from "src/state/game";
import {Bounds} from "src/utils/types";
import {RootState} from "src/state/rootReducer";
import SudokuGame from "src/sudoku-game/SudokuGame";

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

interface MenuCircleOwnProps {
  cell: Cell;
}

const connector = connect(
  (state: RootState) => {
    return {
      notesMode: state.game.notesMode,
      sudoku: state.sudoku.current,
      showHints: state.game.showHints,
    };
  },
  {
    showMenu,
    setNumber,
    setNotes,
    clearNumber,
  },
);

type PropsFromRedux = ConnectedProps<typeof connector>;

class MenuCircle extends React.Component<MenuCircleOwnProps & PropsFromRedux, {}> {
  render() {
    const cell = this.props.cell;
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
        onClick={() => this.props.showMenu()}
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
          className={this.props.notesMode ? "ss_menu-circle-notes" : "ss_menu-circle"}
        />
        {SUDOKU_NUMBERS.map((number, i) => {
          const currentMinRad = minRad + radPerStep * (i + 1);
          const currentMaxRad = currentMinRad + radPerStep;
          let isActive = number === cell.number;

          const conflicting = SudokuGame.conflictingFields(this.props.sudoku);
          const userNotes = this.props.sudoku[this.props.cell.y * 9 + this.props.cell.x].notes;
          const conflictingCell = conflicting[this.props.cell.y * 9 + this.props.cell.x];
          const autoNotes = this.props.showHints ? conflictingCell.possibilities : [];
          const notesToUse = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;

          if (this.props.notesMode) {
            isActive = notesToUse.includes(number);
          }

          const colors = this.props.notesMode
            ? [THEME.menuColors.noteNormal, THEME.menuColors.noteAlternate, THEME.menuColors.noteAlternate2]
            : [THEME.menuColors.normal, THEME.menuColors.alternate, THEME.menuColors.alternate2];

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
                if (this.props.notesMode) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                const newNotes = notesToUse.includes(number)
                  ? notesToUse.filter((note) => note !== number)
                  : [...userNotes, number];
                if (this.props.notesMode) {
                  this.props.setNotes(cell, newNotes);
                } else {
                  if (isActive) {
                    this.props.clearNumber(cell);
                  } else {
                    this.props.setNumber(cell, number);
                  }
                }
              }}
            >
              {number}
            </MenuCirclePart>
          );
        })}
        {/* <MenuCirclePart
          radius={circleRadius}
          notesMode={this.props.notesMode}
          minRad={minRad}
          maxRad={minRad + radPerStep}
          stroke={this.props.notesMode ? THEME.menuColors.alternate : THEME.menuColors.noteAlternate}
          onClick={e => {
            if (!this.props.notesMode) {
              this.props.enterNotesMode();
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {"N"}
        </MenuCirclePart> */}
      </svg>
    );
  }
}

export default connector(MenuCircle);
