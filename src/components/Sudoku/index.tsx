import * as React from 'react';
import * as classNames from 'classnames';
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
import * as _ from 'lodash';
// import * as colors from 'src/utility/colors';
import './styles.scss';

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
      <circle
        r={radius}
        cx={radius * 2}
        cy={radius * 2}
        fill="none"
        className={classNames({
          'ss_menu-circle': !notesMode,
          'ss_menu-circle-hover': !notesMode && isActive,
          'ss_menu-circle-notes': notesMode,
          'ss_menu-circle-notes-hover': notesMode && isActive,
        })}
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

    const containerLeft = '0%';
    const containerTop = '-50%';

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
      <div
        className={'ss_menu-container'}
        style={{
          left: containerLeft,
          top: containerTop,
        }}
      >
        <svg
          className={'ss_menu-circle-container'}
          style={{
            height: circleRadius * 4,
            width: circleRadius * 4,
            transform: `translate(-50%, -50%) rotate(${minRad}rad)`,
          }}
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
        </svg>
      </div>
    );
  }
}

export const MenuComponent = connect<
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

//
// Cell
//

class CellComponentBasic extends React.Component<
  {
    cell: Cell;
    showMenu: (cell) => any;
  },
  {
    notesMode: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      notesMode: false,
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.enterNotesMode = this.enterNotesMode.bind(this);
    this.exitNotesMode = this.exitNotesMode.bind(this);
  }
  shouldComponentUpdate(props, state) {
    return props.cell !== this.props.cell || this.state !== state;
  }
  enterNotesMode() {
    this.setState({
      notesMode: true,
    });
  }
  exitNotesMode() {
    this.setState({
      notesMode: false,
    });
  }
  toggleMenu() {
    this.props.showMenu(this.props.cell);
    this.exitNotesMode();
  }
  render() {
    const cell = this.props.cell;
    const notes = [...cell.notes.values()];
    return (
      <div
        className={classNames('ss_cell-container', {
          'ss_cell-container-initial': cell.initial,
        })}
        onClick={this.toggleMenu}
      >
        <div
          className={classNames('ss_cell', {
            'ss_cell-active': cell.showMenu,
          })}
        >
          <div className={'ss_cell-number'}>
            {this.props.cell.number}
          </div>
          <div className={'ss_cell-note-container'}>
            {notes.sort().map(n => {
              return (
                <div className={'ss_cell-note'}>
                  {n}
                </div>
              );
            })}
          </div>
        </div>
        {this.props.cell.showMenu
          ? <MenuComponent
              enterNotesMode={this.enterNotesMode}
              exitNotesMode={this.exitNotesMode}
              notesMode={this.state.notesMode}
              cell={this.props.cell}
            />
          : null}
      </div>
    );
  }
}

export const CellComponent = connect<
  {},
  {},
  {
    cell: Cell;
  }
>(
  function() {
    return {};
  },
  function(dispatch) {
    return {
      showMenu: cell => dispatch(showMenu(cell)),
    };
  },
)(CellComponentBasic);

//
// Grid
//

/*
    _x = 1       _x = 2     _x = 3
.-----------------------------------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 1
|   y < 3   | y < 3     |   y < 3   |
|-----------------------------------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 2
| 3 < y < 6 | 3 < y < 6 | 3 < y < 6 |
.-----------------------------------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 3
|   y > 6   | y > 6     |   y > 6   |
|-----------------------------------|
*/
function orderCellsIntoSquares(sudoku: Cell[]) {
  return _.groupBy(sudoku, cell => {
    return `${Math.floor(cell.y / 3)}-${Math.floor(cell.x / 3)}`;
  });
}

export const GridComponent: React.StatelessComponent<{
  grid: Cell[];
}> = function _Grid(props) {
  const threeTimesThreeContainer = orderCellsIntoSquares(props.grid);
  const keys = _.sortBy(_.keys(threeTimesThreeContainer), k => k);
  return (
    <div className={'ss_grid-container'}>
      {keys.map(key => {
        const container = threeTimesThreeContainer[key];
        const sorted = _.sortBy(container, c => {
          return `${c.y}-${c.x}`;
        });
        return (
          <div key={key} className={'ss_grid-3x3'}>
            {sorted.map(cell => {
              const k = `${cell.y}-${cell.x}`;
              return <CellComponent key={k} cell={cell} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

function SmallGridLineX({height, width, top}) {
  return (
    <div
      style={{
        height,
        width,
        background: '#AAA',
        position: 'absolute',
        left: 0,
        top,
      }}
    />
  );
}

function SmallGridLineY({height, width, left}) {
  return (
    <div
      style={{
        width,
        height,
        background: '#AAA',
        position: 'absolute',
        top: 0,
        left,
      }}
    />
  );
}

export class SmallSudokuComponent extends React.PureComponent<{
  sudoku: Cell[];
  id: number;
  onClick: () => any;
}> {
  render() {
    const {sudoku, id, onClick} = this.props;
    const height = 150;
    const width = 150;
    const fontSize = 8;

    const xSection = height / 9;
    const ySection = width / 9;
    const fontXOffset = xSection / 2 - 2;
    const fontYOffset = ySection / 2 - 4;

    return (
      <div
        onClick={onClick}
        className={'ss_small-sudoku'}
        style={{
          height,
          width,
          fontSize,
          lineHeight: fontSize + 'px',
        }}
      >
        <div
          className='ss_small-sudoku-title'
        >
          {id}
        </div>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const makeBold = i % 3 === 0;
          const lineWidth = makeBold ? 2 : 1;
          return (
            <SmallGridLineX
              key={i}
              height={lineWidth}
              width={width}
              top={i * height / 9 - lineWidth / 2}
            />
          );
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const makeBold = i % 3 === 0;
          const lineWidth = makeBold ? 2 : 1;
          return (
            <SmallGridLineY
              key={i}
              height={height}
              width={lineWidth}
              left={i * height / 9 - lineWidth / 2}
            />
          );
        })}
        {sudoku.map((c, i) => {
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: xSection * c.x + fontXOffset,
                top: ySection * c.y + fontYOffset,
              }}
            >
              {c.number}
            </div>
          );
        })}
      </div>
    );
  }
}
