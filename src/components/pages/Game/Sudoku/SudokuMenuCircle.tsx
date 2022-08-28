import * as React from "react";
import {connect, ConnectedProps} from "react-redux";
import {setNumber, clearNumber, setNote, clearNote} from "src/state/sudoku";
import {SUDOKU_NUMBERS} from "src/engine/utility";
import {Cell} from "src/engine/types";
import styled, {css} from "styled-components";
import THEME from "src/theme";
import {showMenu} from "src/state/game";
import {Bounds} from "src/utils/types";
import {RootState} from "src/state/rootReducer";

const MenuCircleContainer = styled.svg`
  z-index: 7;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
`;

const MenuCirclePartComponent = styled.circle<{
  notesMode: boolean;
  isActive: boolean;
}>`
  stroke-width: 50px;
  opacity: 0.75;

  &:hover {
    stroke-width: 60px;
    cursor: pointer;
    fill-opacity: 0.9;
  }

  ${(props) =>
    props.isActive &&
    css`
      stroke-width: 60px;
      cursor: pointer;
      fill-opacity: 0.9;
    `}
`;

export const MenuContainer = styled.div<{bounds: Bounds}>`
  position: absolute;
  width: ${(props) => props.bounds.width}%;
  height: ${(props) => props.bounds.height}%;
  top: ${(props) => props.bounds.top}%;
  left: ${(props) => props.bounds.left}%;
`;

export const MenuWrapper = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;

  /* We just hide it on mobile, as it's not useful there */
  @media (max-width: ${THEME.widths.hideCircleMenu}px) {
    display: none;
  }
`;

const TAU = Math.PI * 2;

//
// Menu
//

const MenuCirclePart: React.StatelessComponent<{
  radius: number;
  notesMode: boolean;
  isActive: boolean;
  onClick: (e: any) => void;
  minRad: number;
  maxRad: number;
  children?: React.ReactChild;
  stroke: string;
}> = ({radius, notesMode, isActive, onClick, minRad, maxRad, children, stroke}) => {
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
      <MenuCirclePartComponent
        notesMode={notesMode}
        isActive={isActive}
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
};

interface MenuCircleOwnProps {
  cell: Cell;
}

const connector = connect(
  (state: RootState) => {
    return {
      notesMode: state.game.showNotes,
    };
  },
  {
    showMenu,
    setNumber,
    setNote,
    clearNote,
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

    // TODO: use these only dymanically on small screens
    const minRad = 0;
    const maxRad = TAU;

    const usedRad = Math.abs(maxRad - minRad);
    const circumCircle = TAU * circleRadius;
    const radPerStep = usedRad / SUDOKU_NUMBERS.length;

    return (
      <MenuCircleContainer
        style={{
          height: circleRadius * 4,
          width: circleRadius * 4,
          transform: `translate(-50%, -50%) rotate(${minRad}rad)`,
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

          if (this.props.notesMode) {
            isActive = cell.notes.includes(number);
          }

          const colors = this.props.notesMode
            ? [THEME.menuColors.noteNormal, THEME.menuColors.noteAlternate, THEME.menuColors.noteAlternate2]
            : [THEME.menuColors.normal, THEME.menuColors.alternate, THEME.menuColors.alternate2];

          const stroke = colors[i % colors.length];

          return (
            <MenuCirclePart
              key={i}
              radius={circleRadius}
              notesMode={this.props.notesMode}
              isActive={isActive}
              minRad={currentMinRad}
              stroke={stroke}
              maxRad={currentMaxRad}
              onClick={(e) => {
                if (this.props.notesMode) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                if (isActive) {
                  if (this.props.notesMode) {
                    this.props.clearNote(cell, number);
                  } else {
                    this.props.clearNumber(cell);
                  }
                  return;
                }
                if (this.props.notesMode) {
                  this.props.setNote(cell, number);
                } else {
                  this.props.setNumber(cell, number);
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
      </MenuCircleContainer>
    );
  }
}

export default connector(MenuCircle);
