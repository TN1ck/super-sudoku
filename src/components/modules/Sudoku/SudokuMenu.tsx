import * as React from 'react';
import {connect} from 'react-redux';
import {
  showMenu,
  setNumber,
  clearNumber,
  setNote,
  clearNote,
} from 'src/ducks/sudoku';
import {Cell} from 'src/ducks/sudoku/model';
import {SUDOKU_NUMBERS} from 'src/engine/utility';
import styled, { css } from 'styled-components';
import THEME from 'src/theme';
import { withProps } from 'src/utils';

const MenuCircleContainer = styled.svg`
  z-index: 7;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
`;

const MenuCircleComponent = withProps<{
  notesMode: boolean;
  isActive: boolean;
}>()(styled.circle)`
  stroke-width: 50px;
  stroke: ${THEME.colors.primary};

  &:hover {
      stroke-width: 60px;
      cursor: pointer;
      stroke: ${THEME.colors.primary};
  }

  ${props => props.notesMode && css`
    stroke-width: 50px;
    stroke: black;

    &:hover {
        stroke-width: 60px;
        cursor: pointer;
        stroke: black;
    }
  `}
  ${props => props.notesMode && props.isActive && css`
    stroke-width: 60px;
    cursor: pointer;
    stroke: black;
  `}

  ${props => !props.notesMode && props.isActive && css`
    stroke-width: 60px;
    cursor: pointer;
    stroke: ${THEME.colors.primary};
  `}

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
}> = function MenuCircle({
  radius,
  notesMode,
  isActive,
  onClick,
  minRad,
  maxRad,
  children,
}) {
  const yOffset = 7;
  const textRadius = radius + 8;
  const circumCircle = TAU * radius;
  const step = Math.abs(maxRad - minRad);
  const center = radius * 2;
  const x = textRadius * Math.cos(minRad + step * 0.5) + center;
  const y = textRadius * Math.sin(minRad + step * 0.5) + center + yOffset;

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
          strokeDashoffset: -(minRad / TAU * circumCircle),
          strokeDasharray: `${step / TAU * circumCircle} ${circumCircle}`,
        }}
      />
      <text
        x={x}
        y={y}
        style={{
          fill: 'white',
          textAnchor: 'middle',
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        {children}
      </text>
    </g>
  );
};

class Menu extends React.Component<
  {
    cell: Cell;
    setNumber: (cell, number) => any;
    setNote: (cell, number) => any;
    clearNote: (cell, number) => any;
    showMenu: (cell) => any;
    clearNumber: (cell) => any;
    enterNotesMode: () => any;
    exitNotesMode: () => any;
    notesMode: boolean;
  },
  {}
> {
  render() {
    const cell = this.props.cell;
    const circleRadius = 45;

    // TODO: use these only dymanically on small screens
    const minRad = 0;
    const maxRad = TAU;

    // if (cell.x === 0) {
    //     minRad = (TAU / 4) * -1;
    //     maxRad = (TAU / 4) * 1;
    //     containerLeft = '-50%';
    // }

    // if (cell.x === 8) {
    //     minRad = (TAU / 4) * 1;
    //     maxRad = (TAU / 4) * 3;
    //     containerLeft = '50%';
    // }

    const usedRad = Math.abs(maxRad - minRad);
    const circumCircle = TAU * circleRadius;
    const radPerStep = usedRad / (SUDOKU_NUMBERS.length + 1);
    // const step = (radPerStep / TAU);

    return (
      <MenuCircleContainer
        style={{
          height: circleRadius * 4,
          width: circleRadius * 4,
          transform: `translate(-50%, -50%) rotate(${minRad}rad)`,
        }}
        onClick={() => this.props.showMenu(cell)}
      >
        <circle
          r={circleRadius}
          cx={circleRadius * 2}
          cy={circleRadius * 2}
          style={{
            pointerEvents: 'none',
            strokeDashoffset: 0,
            strokeDasharray: `${usedRad /
              TAU *
              circumCircle} ${circumCircle}`,
          }}
          fill="none"
          className={
            this.props.notesMode ? 'ss_menu-circle-notes' : 'ss_menu-circle'
          }
        />
        {SUDOKU_NUMBERS.map((number, i) => {
          const currentMinRad = minRad + radPerStep * (i + 1);
          const currentMaxRad = currentMinRad + radPerStep;
          let isActive = number === cell.number;
          if (this.props.notesMode) {
            isActive = cell.notes.has(number);
          }
          return (
            <MenuCircle
              radius={circleRadius}
              notesMode={this.props.notesMode}
              isActive={isActive}
              minRad={currentMinRad}
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
          onClick={e => {
            if (!this.props.notesMode) {
              this.props.enterNotesMode();
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {'N'}
        </MenuCircle>
      </MenuCircleContainer>
    );
  }
}

const MenuComponent = connect<
  {},
  {},
  {
    cell: Cell;
    notesMode: boolean;
    enterNotesMode: () => any;
    exitNotesMode: () => any;
  }
>(
  function() {
    return {};
  },
  function(dispatch) {
    return {
      showMenu: cell => dispatch(showMenu(cell)),
      setNumber: (cell, number) => dispatch(setNumber(cell, number)),
      setNote: (cell, number) => dispatch(setNote(cell, number)),
      clearNote: (cell, number) => dispatch(clearNote(cell, number)),
      clearNumber: cell => dispatch(clearNumber(cell)),
    };
  },
)(Menu);

export default MenuComponent;
