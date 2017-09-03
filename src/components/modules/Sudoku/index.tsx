import * as React from 'react';
import * as classNames from 'classnames';
import * as d3Path from 'd3-path';
import {connect} from 'react-redux';
import {
  showMenu,
} from 'src/ducks/sudoku';
import {Cell} from 'src/ducks/sudoku/model';
import * as _ from 'lodash';
import './styles.scss';

import MenuComponent from './SudokuMenu';

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
    if (!this.props.cell.initial) {
      this.props.showMenu(this.props.cell);
      this.exitNotesMode();
    }
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

//
//
//

class SudokuComponentNew extends React.PureComponent<{
  sudoku: Cell[];
  showMenu?: typeof showMenu;
}, {
  height: number;
  width: number;
  notesMode: boolean;
}> {
  _isMounted: boolean = false;
  element: HTMLElement;
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
      notesMode: false,
    };
    this.setRef = this.setRef.bind(this);
    this.enterNotesMode = this.enterNotesMode.bind(this);
    this.exitNotesMode = this.exitNotesMode.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
  }

  setRef(el: HTMLElement) {
    this.element = el;
    if (el) {
      const height = el.clientHeight;
      const width = el.clientWidth;
      this.setState({
        height,
        width,
      });
    }
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
    return;
  }

  render() {
    const {sudoku} = this.props;
    const size = Math.min(this.state.height, this.state.width);
    const height = size;
    const width = size;
    const fontSize = 14;
    const fontSizeNotes = 11;
    const notePadding = 4;

    const xSection = height / 9;
    const ySection = width / 9;

    const fontXOffset = xSection / 2;
    const fontYOffset = ySection / 2;

    const activeCell = sudoku.find(c => {
      return c.showMenu;
    });
    const selectionPosition = {
      x: activeCell && activeCell.x || 0,
      y: activeCell && activeCell.y || 0,
    };

    const setNumbersPositions = sudoku.map(c => {
      return {
        cell: {
          x: xSection * c.x + fontXOffset,
          y: ySection * c.y + fontYOffset,
        },
        notes: [...c.notes.values()].map(n => {
          const positions = [
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 2, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 1},
            {x: 2, y: 1},
            {x: 0, y: 2},
            {x: 1, y: 2},
            {x: 2, y: 2},
          ];
          const {x, y} = positions[n];
          const noteWidth = xSection - notePadding * 2;
          const noteHeight = ySection - notePadding * 2;
          return {
            x: (noteWidth / 3) * (x + 0.5) + notePadding,
            y: (noteHeight / 3) * (y + 0.5) + notePadding ,
          };
        }),
      };
    });

    const paths = [
      // {
      //   from: {x: 10, y: 10},
      //   to: {x: 300, y: 300},
      // },
    ];

    const sudokuWithIndex = sudoku.map((c, i) => ({...c, index: i}));

    sudokuWithIndex.forEach((cell, i) => {
      const position = setNumbersPositions[i];
      const rowCells = sudokuWithIndex.filter(c => c.x === cell.x);
      const columnCells = sudokuWithIndex.filter(c => c.y === cell.y);
      const squares = _.values(
        _.groupBy(sudokuWithIndex, (c) => {
          return `${Math.floor(c.x / 3)}-${Math.floor(c.y / 3)}`;
        }),
      );
      const squareCells = squares.filter(square => {
        return square.indexOf(cell) !== -1;
      })[0];

      const all = rowCells
        .concat(columnCells)
        .concat(squareCells)
        .filter(c => c.index !== cell.index)
        .filter(c => c.number !== undefined);

      all.forEach(c => {
        const targetPosition = setNumbersPositions[c.index];
        if (c.number === cell.number && c.index !== cell.index) {
          paths.push({from: position.cell, to: targetPosition.cell, index: c.index});
        }
      });
    });

    const showMarker = false;

    const getNextInterSection = (x, y) => {
      const nextIntersectionX = xSection * Math.floor(x / xSection);
      const nextIntersectionY = ySection * Math.floor(y / ySection);
      return {x: nextIntersectionX, y: nextIntersectionY};
    };

    const getFromTo = (from, to) => {
      const startToFrame = getNextInterSection(from.x, from.y);
      const frameToEnd = getNextInterSection(to.x, to.y);
      return {
        from: {
          x: startToFrame.x + (from.x < to.x ? xSection : 0),
          y: startToFrame.y + (from.y < to.y ? ySection : 0),
        },
        to: {
          x: frameToEnd.x + (from.x > to.x ? xSection : 0),
          y: frameToEnd.y + (from.y > to.y ? ySection : 0),
        },
      };
    };

    return (
      <div
        ref={this.setRef}
        style={{height: '100%', position: 'absolute', width: '100%'}}>
        <svg
          width={width}
          height={height}
          style={{
            position: 'absolute',
            zIndex: 1,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {paths.map(({from, to}) => {

            if (from.index > to.index)  {
              const temp = from;
              from = to;
              to = temp;
            }

            const {
              from: startToFrame,
              to: frameToEnd,
            } = getFromTo(from, to);

            const path = d3Path.path();

            path.moveTo(from.x, from.y);
            path.lineTo(from.x, startToFrame.y);
            path.lineTo(startToFrame.x, startToFrame.y);
            path.lineTo(startToFrame.x, frameToEnd.y);
            path.lineTo(frameToEnd.x, frameToEnd.y);
            path.lineTo(to.x, frameToEnd.y);
            path.lineTo(to.x, to.y);

            const d = path.toString();
            return (
              <path
                stroke="red" strokeWidth="2" fill="none"
                d={d}
              />
            );
          })}
        </svg>
        <div
          style={{
            transition: 'background 500ms ease-out',
            top: 0,
            left: 0,
            height,
            width,
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        />
        <div
          className={`ss_small-sudoku`}
          style={{
            height,
            width,
            fontSize,
            lineHeight: fontSize + 'px',
          }}
        >
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
            const onClick = () => {
              this.exitNotesMode();
              this.props.showMenu(c);
            };
            const position = setNumbersPositions[i];
            return (
              <div key={i}>
                <div
                  style={{
                    position: 'absolute',
                    height: ySection,
                    width: xSection,
                    left: xSection * c.x,
                    top: ySection * c.y,
                    zIndex: c.showMenu ? 8 : 0,
                  }}
                  onClick={onClick}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: position.cell.x,
                    top: position.cell.y,
                    fontWeight: c.initial ? 'bold' : 'normal',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }}
                >
                  {c.number}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: xSection * c.x,
                    top: ySection * c.y,
                    fontWeight: c.initial ? 'bold' : 'normal',
                    pointerEvents: 'none',
                    width: xSection,
                    height: ySection,
                  }}
                >
                  {[...c.notes.values()].map((n, noteIndex) => {
                    const notePosition = position.notes[noteIndex];
                    return (
                      <div
                        key={n}
                        style={{
                          fontSize: fontSizeNotes,
                          position: 'absolute',
                          left: notePosition.x,
                          top: notePosition.y,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        {n}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
         {showMarker
            ? <div
                style={{
                  position: 'absolute',
                  transition: 'transform 150ms ease-out',
                  top: 0,
                  left: 0,
                  transform: `translate(${xSection * selectionPosition.x}px, ${ySection * selectionPosition.y}px)`,
                  height: ySection,
                  width: xSection,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  borderColor: 'blue',
                }}
              />
            : null
          }
          <div
            style={{
              position: 'absolute',
              top: ySection * selectionPosition.y,
              left: xSection * selectionPosition.x,
              height: ySection,
              width: xSection,
            }}
          >
            {activeCell
              ? <div
                  style={{
                    position: 'relative',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.75,
                  }}
                >
                  <MenuComponent
                    enterNotesMode={this.enterNotesMode}
                    exitNotesMode={this.exitNotesMode}
                    notesMode={this.state.notesMode}
                    cell={activeCell}
                  />
                </div>
              : null}
          </div>
        </div>
      </div>
    );
  }
}

export const SudokuComponentNewConnected = connect(null, {showMenu})(SudokuComponentNew);

//
// Small Sudoku
//

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
  darken?: boolean;
  elevation?: number;
  onClick: () => any;
}> {
  render() {
    const {sudoku, id, onClick, darken, elevation} = this.props;
    const height = 150;
    const width = 150;
    const fontSize = 8;

    const xSection = height / 9;
    const ySection = width / 9;
    const fontXOffset = xSection / 2 - 2;
    const fontYOffset = ySection / 2 - 4;

    return (
      <div>
         <div
          style={{
            background: `rgba(255, 255, 255, ${darken ? 0.5 : 0})`,
            transition: 'background 500ms ease-out',
            top: 0,
            left: 0,
            height,
            width,
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        />
        <div
          onClick={onClick}
          className={`ss_small-sudoku ss_elevation-${elevation}`}
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
      </div>
    );
  }
}
