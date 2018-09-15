import * as React from 'react';
import * as d3Path from 'd3-path';
import {connect} from 'react-redux';
import {
  showMenu,
} from 'src/ducks/sudoku';
import {Cell} from 'src/ducks/sudoku/model';

import {COLORS} from 'src/utils/colors';

import * as _ from 'lodash';

import MenuComponent from './SudokuMenu';
import { CellInner, CellNumber, CellNoteContainer, CellNote, CellContainer, Grid33, SudokuSmall, SmallGridLineX, GridCell, SmallGridLineY, GridCellNumber } from 'src/components/modules/Sudoku/modules';

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
      <CellContainer
        initial={cell.initial}
        onClick={this.toggleMenu}
      >
        <CellInner active={cell.showMenu}>
          <CellNumber>
            {this.props.cell.number}
          </CellNumber>
          <CellNoteContainer>
            {notes.sort().map(n => {
              return (
                <CellNote>
                  {n}
                </CellNote>
              );
            })}
          </CellNoteContainer>
        </CellInner>
        {this.props.cell.showMenu
          ? <MenuComponent
              enterNotesMode={this.enterNotesMode}
              exitNotesMode={this.exitNotesMode}
              notesMode={this.state.notesMode}
              cell={this.props.cell}
            />
          : null}
      </CellContainer>
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
          <Grid33 key={key}>
            {sorted.map(cell => {
              const k = `${cell.y}-${cell.x}`;
              return <CellComponent key={k} cell={cell} />;
            })}
          </Grid33>
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
    this.setDimensions = this.setDimensions.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
  }

  setRef(el: HTMLElement) {
    this.element = el;
    this.setDimensions();
    window.addEventListener('resize', this.setDimensions)
  }

  setDimensions() {
    if (this.element) {
      const height = this.element.clientHeight;
      const width = this.element.clientWidth;
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
          cell: c,
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
            y: (noteHeight / 3) * (y + 0.5) + notePadding,
            cell: c,
            note: n,
          };
        }),
      };
    });

    const paths: Array<{
      from: {
        x: number; y: number; cell: Cell;
      };
      to: {
        x: number; y: number; cell: Cell;
      };
      index: number;
    }> = [
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
        c.notes.forEach((n, i) => {
          if (cell.number === n || cell.notes.has(n)) {
            paths.push({from: position.cell, to: targetPosition.notes[i], index: c.index});
          }
        });
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

            const {
              from: startToFrame,
              to: frameToEnd,
            } = getFromTo(from, to);

            const path = d3Path.path();

            path.moveTo(from.x, from.y);
            path.lineTo(from.x, startToFrame.y);
            if (from.x !== to.x && Math.abs(from.y - to.y) !== 1) {
              path.lineTo(startToFrame.x, startToFrame.y);
              path.lineTo(startToFrame.x, frameToEnd.y);
              path.lineTo(frameToEnd.x, frameToEnd.y);
            }
            path.lineTo(to.x, frameToEnd.y);
            path.lineTo(to.x, to.y);

            const d = path.toString();
            const color = COLORS[from.cell.number];
            return (
              <g>
                <path
                  stroke={color} strokeWidth="2" fill="none"
                  d={d}
                />
                <circle r={fontSize} cx={from.x} cy={from.y} stroke={color} strokeWidth="2" fill="white"/>
                <circle r={fontSize} cx={to.x} cy={to.y} stroke={color} strokeWidth="2" fill="white" />
              </g>
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
        <SudokuSmall
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
            const background = makeBold ? '#AAAAAA' : '#EEEEEE';
            return (
              <SmallGridLineX
                key={i}
                height={lineWidth}
                width={width}
                top={i * height / 9 - lineWidth / 2}
                background={background}
              />
            );
          })}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
            const makeBold = i % 3 === 0;
            const lineWidth = makeBold ? 2 : 1;
            const background = makeBold ? '#AAAAAA' : '#EEEEEE';
            return (
              <SmallGridLineY
                key={i}
                height={height}
                width={lineWidth}
                left={i * height / 9 - lineWidth / 2}
                background={background}
              />
            );
          })}
          {sudoku.map((c, i) => {
            const onClick = () => {
              if (!c.initial) {
                this.exitNotesMode();
                this.props.showMenu(c);
              }
            };
            const position = setNumbersPositions[i];
            return (
              <div key={i}>
                <GridCell
                  style={{
                    position: 'absolute',
                    height: ySection,
                    width: xSection,
                    left: xSection * c.x,
                    top: ySection * c.y,
                    zIndex: 0,
                  }}
                  onClick={onClick}
                />
                <GridCellNumber
                  left={position.cell.x}
                  top={position.cell.y}
                  initial={c.initial}
                >
                  {c.number}
                </GridCellNumber>
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
                    zIndex: 3,
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
        </SudokuSmall>
      </div>
    );
  }
}

export const SudokuComponentNewConnected = connect(null, {showMenu})(SudokuComponentNew);
