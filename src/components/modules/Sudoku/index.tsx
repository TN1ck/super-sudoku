import * as React from 'react';
import {connect} from 'react-redux';
import {
  showMenu,
} from 'src/ducks/sudoku';
import {Cell} from 'src/ducks/sudoku/model';

import * as _ from 'lodash';

import MenuComponent, { MenuWrapper } from './SudokuMenu';
import { CellInner, CellNumber, CellNoteContainer, CellNote, CellContainer, Grid33, SudokuSmall, SmallGridLineX, GridCell, SmallGridLineY, GridCellNumber } from 'src/components/modules/Sudoku/modules';
import SudokuState from 'src/components/modules/Sudoku/state';
import SudokuPaths from 'src/components/modules/Sudoku/SudokuPaths';

const fontSize = 14;
const fontSizeNotes = 11;

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
        <SudokuPaths
          paths={uniquePaths}
          fontSize={fontSize}
          width={width}
          height={height}
        />
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
                <MenuWrapper>
                  <MenuComponent
                    enterNotesMode={this.enterNotesMode}
                    exitNotesMode={this.exitNotesMode}
                    notesMode={this.state.notesMode}
                    cell={activeCell}
                  />
                </MenuWrapper>
              </div>
            ) : null
          }
        </SudokuSmall>
      </div>
    );
  }
}

export const SudokuComponentNewConnected = connect(null, {showMenu})(SudokuComponentNew);
