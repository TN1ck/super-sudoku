import * as React from "react";
import {connect} from "react-redux";
import {setNumber, clearNumber, setNote, clearNote} from "src/ducks/sudoku";
import {Cell} from "src/ducks/sudoku/model";
import {SUDOKU_NUMBERS} from "src/engine/utility";
import styled, {css} from "styled-components";
import THEME from "src/theme";
import {showMenu} from "src/ducks/game";

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

const MenuCircleComponent = styled.circle<{
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

  ${props =>
    props.isActive &&
    css`
      stroke-width: 60px;
      cursor: pointer;
      fill-opacity: 0.9;
    `}
`;

export const MenuWrapper = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;

  @media (max-width: 600px) {
    transform: translate(-50%, -50%) scale(0.7);
  }
`;

const TAU = Math.PI * 2;

//
// Menu
//

const MenuCircle: React.StatelessComponent<{
  radius: number;
  notesMode?: boolean;
  isActive?: boolean;
  onClick: (any) => void;
  minRad: number;
  maxRad: number;
  children?: React.ReactChild;
  stroke: string;
}> = function MenuCircle({radius, notesMode, isActive, onClick, minRad, maxRad, children, stroke}) {
  const yOffset = 7;
  const textRadius = radius + 8;
  const circumCircle = TAU * radius;
  const step = Math.abs(maxRad - minRad);

  const center = radius * 2;
  const x = textRadius * Math.cos(minRad + step * 0.5) + center;
  const y = textRadius * Math.sin(minRad + step * 0.5) + center + yOffset;

  const strokeDashoffset = -((minRad / TAU) * circumCircle);
  const strokeDasharray = `${(step / TAU) * circumCircle} ${circumCircle}`;

  return (
    <g>
      <MenuCircleComponent
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

interface MenuOwnProps {
  cell: Cell;
  notesMode: boolean;
  enterNotesMode: () => void;
  exitNotesMode: () => void;
}

interface MenuDispatchProps {
  setNumber: typeof setNumber;
  setNote: typeof setNote;
  clearNote: typeof clearNote;
  showMenu: typeof showMenu;
  clearNumber: typeof clearNumber;
}

class Menu extends React.Component<MenuOwnProps & MenuDispatchProps, {}> {
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
    const radPerStep = usedRad / (SUDOKU_NUMBERS.length + 1);

    return (
      <MenuCircleContainer
        style={{
          height: circleRadius * 4,
          width: circleRadius * 4,
          transform: `translate(-50%, -50%) rotate(${minRad}rad)`,
        }}
        onClick={() => this.props.showMenu(null)}
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
            isActive = cell.notes.has(number);
          }

          const useAlt = i % 2 === 0;
          const stroke = this.props.notesMode
            ? useAlt
              ? THEME.menuColors.noteNormal
              : THEME.menuColors.noteAlternate
            : useAlt
            ? THEME.menuColors.normal
            : THEME.menuColors.alternate;

          return (
            <MenuCircle
              key={i}
              radius={circleRadius}
              notesMode={this.props.notesMode}
              isActive={isActive}
              minRad={currentMinRad}
              stroke={stroke}
              maxRad={currentMaxRad}
              onClick={e => {
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
            </MenuCircle>
          );
        })}
        <MenuCircle
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
        </MenuCircle>
      </MenuCircleContainer>
    );
  }
}

const MenuComponent = connect<null, MenuDispatchProps, MenuOwnProps>(
  null,
  {
    showMenu,
    setNumber,
    setNote,
    clearNote,
    clearNumber,
  },
)(Menu);

export default MenuComponent;
