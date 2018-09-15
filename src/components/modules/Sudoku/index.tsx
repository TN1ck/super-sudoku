import * as React from 'react';
import {connect} from 'react-redux';
import {
  showMenu,
} from 'src/ducks/sudoku';
import {Cell} from 'src/ducks/sudoku/model';

import {COLORS} from 'src/utils/colors';

import * as _ from 'lodash';

import MenuComponent from './SudokuMenu';
import { CellInner, CellNumber, CellNoteContainer, CellNote, CellContainer, Grid33, SudokuSmall, SmallGridLineX, GridCell, SmallGridLineY, GridCellNumber } from 'src/components/modules/Sudoku/modules';

interface CellIndexed extends Cell {
  index: number;
}

interface PositionedCell {
  cell: Cell;
  x: number;
  y: number;
}

interface NoteCell {
  x: number;
  y: number;
  cell: Cell;
  note: number;
}

interface PositionedNoteCell {
  cell: PositionedCell;
  notes: NoteCell[];
}

interface ConflictingCell {
  cell: CellIndexed,
  conflicting: CellIndexed[];
}

interface ConflictingPath {
  from: PositionedNoteCell;
  to: PositionedNoteCell;
  index: number;
}

const fontSize = 14;
const fontSizeNotes = 11;
const notePadding = 4;

class SudokuState {

  width: number;
  height: number;

  get xSection() {
    const xSection = this.height / 9;
    return xSection;
  }

  get ySection() {
    const ySection = this.width / 9;
    return ySection;
  }

  getNextInterSection(x, y) {
    const nextIntersectionX = this.xSection * Math.floor(x / this.xSection);
    const nextIntersectionY = this.ySection * Math.floor(y / this.ySection);
    return {x: nextIntersectionX, y: nextIntersectionY};
  }

  getFromTo(from, to) {
    const startToFrame = this.getNextInterSection(from.x, from.y);
    const frameToEnd = this.getNextInterSection(to.x, to.y);
    return {
      from: {
        x: startToFrame.x + (from.x < to.x ? this.xSection : 0),
        y: startToFrame.y + (from.y < to.y ? this.ySection : 0),
      },
      to: {
        x: frameToEnd.x + (from.x > to.x ? this.xSection : 0),
        y: frameToEnd.y + (from.y > to.y ? this.ySection : 0),
      },
    };
  }

  uniquePaths(paths: ConflictingPath[]) {
    return _.uniqBy(paths, p => {
      const fromCell = p.from;
      const toCell = p.to;
      return [`${fromCell.cell.x}-${fromCell.cell.y}`, `${toCell.cell.x}-${toCell.cell.y}`].sort().join('-');
    });
  }

  positionedCells(sudoku: Cell[]): PositionedNoteCell[] {

    const fontXOffset = this.xSection / 2;
    const fontYOffset = this.ySection / 2;


    return sudoku.map(c => {
      const positionedCell: PositionedCell = {
        x: this.xSection * c.x + fontXOffset,
        y: this.ySection * c.y + fontYOffset,
        cell: c,
      };

      const noteCells: NoteCell[] = [...c.notes.values()].map(n => {
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
        const noteWidth = this.xSection - notePadding * 2;
        const noteHeight = this.ySection - notePadding * 2;
        return {
          x: (noteWidth / 3) * (x + 0.5) + notePadding,
          y: (noteHeight / 3) * (y + 0.5) + notePadding,
          cell: c,
          note: n,
        };
      });

      return {
        cell: positionedCell,
        notes: noteCells,
      };
    });
  }

  conflictingFields(sudoku: Cell[]): ConflictingCell[] {
    const sudokuWithIndex: CellIndexed[] = sudoku.map((c, i) => ({...c, index: i}));

    return sudokuWithIndex.map((cell, i) => {
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

      return {
        cell,
        conflicting: all,
      }
    });
  }

  getPathsFromConflicting(
    conflictingCell: ConflictingCell,
    positionedCells: PositionedNoteCell[],
    ): ConflictingPath[] {
      const {conflicting, cell} = conflictingCell;
      const paths = [];
      conflicting.forEach(c => {
        const targetPosition = positionedCells[c.index];
        const fromPosition = positionedCells[cell.index];
        if (c.number === cell.number && c.index !== cell.index) {
          const path: ConflictingPath = {
            from: fromPosition,
            to: targetPosition,
            index: c.index
          };
          console.log(path);
          paths.push(path);
        }
      });

      return paths;
  }
}

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

    const xSection = height / 9;
    const ySection = width / 9;

    const activeCell = sudoku.find(c => {
      return c.showMenu;
    });
    const selectionPosition = {
      x: activeCell && activeCell.x || 0,
      y: activeCell && activeCell.y || 0,
    };


    const state = new SudokuState();
    state.width = width;
    state.height = height;
    const positionedCells = state.positionedCells(sudoku);
    const conflicting = state.conflictingFields(sudoku);
    const uniquePaths = _.flatten(conflicting.map(c => {
      const paths = state.getPathsFromConflicting(c, positionedCells);
      const uniquePaths = state.uniquePaths(paths);
      return uniquePaths;
    }));


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
          {uniquePaths.map((c, i) => {
            const from = c.from.cell;
            const to = c.to.cell;
            const path = `
              M ${from.x} ${from.y}
              L ${from.x} ${to.y}
              L ${to.x} ${to.y}
            `;

            const color = COLORS[from.cell.number];
            return (
              <g key={i}>
                <path
                  stroke={color} strokeWidth="2" fill="none"
                  d={path}
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
            const position = positionedCells[i];
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
          {
            activeCell ? (
              <div
                style={{
                  position: 'absolute',
                  top: ySection * selectionPosition.y,
                  left: xSection * selectionPosition.x,
                  height: ySection,
                  width: xSection,
                }}
              >
                <div
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
              </div>
            ) : null
          }
        </SudokuSmall>
      </div>
    );
  }
}

export const SudokuComponentNewConnected = connect(null, {showMenu})(SudokuComponentNew);
