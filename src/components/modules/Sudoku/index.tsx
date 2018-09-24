import * as React from "react";
import { connect } from "react-redux";
import { showMenu } from "src/ducks/game";
import { Cell } from "src/ducks/sudoku/model";

import * as _ from "lodash";

import SudokuMenu, { MenuWrapper } from "./SudokuMenu";
import {
  SudokuSmall,
  SmallGridLineX,
  GridCell,
  SmallGridLineY,
  GridCellNumber,
  CellNote,
  CellNoteContainer
} from "src/components/modules/Sudoku/modules";
import SudokuState from "src/components/modules/Sudoku/state";
import SudokuPaths from "src/components/modules/Sudoku/SudokuPaths";
import { RootState } from "src/ducks";

const fontSize = 14;
// const fontSizeNotes = 11;

interface SudokuComponentStateProps {
  showMenuForCell: Cell;
  sudoku: Cell[];
  showHints: boolean;
}

interface SudokuComponentDispatchProps {
  showMenu: typeof showMenu;
}

interface SudokuComponentOwnProps {}

class SudokuComponent extends React.PureComponent<
  SudokuComponentDispatchProps &
    SudokuComponentStateProps &
    SudokuComponentOwnProps,
  {
    height: number;
    width: number;
    notesMode: boolean;
  }
> {
  _isMounted: boolean = false;
  element: HTMLElement;
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
      notesMode: false
    };
    this.setRef = this.setRef.bind(this);
    this.enterNotesMode = this.enterNotesMode.bind(this);
    this.exitNotesMode = this.exitNotesMode.bind(this);
    this.setDimensions = this.setDimensions.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
    window.addEventListener("click", () => {
      if (this.props.showMenuForCell !== null) {
        this.props.showMenu(null);
      }
    });
  }

  setRef(el: HTMLElement) {
    this.element = el;
    this.setDimensions();
    window.addEventListener("resize", this.setDimensions);
  }

  setDimensions() {
    if (this.element) {
      const height = this.element.clientHeight;
      const width = this.element.clientWidth;
      this.setState({
        height,
        width
      });
    }
  }

  enterNotesMode() {
    this.setState({
      notesMode: true
    });
  }
  exitNotesMode() {
    this.setState({
      notesMode: false
    });
  }
  toggleMenu() {
    return;
  }

  render() {
    const { sudoku, showHints } = this.props;
    const size = Math.min(this.state.height, this.state.width);
    const height = size;
    const width = size;

    const xSection = height / 9;
    const ySection = width / 9;

    const activeCell =
      this.props.showMenuForCell &&
      sudoku.find(
        c =>
          c.x === this.props.showMenuForCell.x &&
          c.y === this.props.showMenuForCell.y
      );
    const selectionPosition = {
      x: (activeCell && activeCell.x) || 0,
      y: (activeCell && activeCell.y) || 0
    };

    const state = new SudokuState();
    state.width = width;
    state.height = height;
    const positionedCells = state.positionedCells(sudoku);
    const conflicting = state.conflictingFields(sudoku);
    const uniquePaths = state.uniquePaths(
      _.flatten(
        conflicting.map(c => {
          return state.getPathsFromConflicting(c, sudoku);
        })
      )
    );

    const pathCells = _.flatten(
      uniquePaths.map(p => {
        return state.getPathBetweenCell(p.from, p.to);
      })
    );

    console.log(pathCells);

    return (
      <div
        ref={this.setRef}
        style={{ height: "100%", position: "absolute", width: "100%" }}
      >
        {/* <SudokuPaths
          paths={uniquePaths}
          fontSize={fontSize}
          width={width}
          height={height}
        /> */}
        <div
          style={{
            transition: "background 500ms ease-out",
            top: 0,
            left: 0,
            height,
            width,
            position: "absolute",
            pointerEvents: "none",
            zIndex: 6
          }}
        />
        <SudokuSmall
          style={{
            height,
            width,
            fontSize,
            lineHeight: fontSize + "px"
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
            const makeBold = i % 3 === 0;
            const lineWidth = makeBold ? 2 : 1;
            const background = makeBold ? "#AAAAAA" : "#EEEEEE";
            return (
              <SmallGridLineX
                key={i}
                height={lineWidth}
                width={width}
                top={(i * height) / 9 - lineWidth / 2}
                background={background}
              />
            );
          })}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
            const makeBold = i % 3 === 0;
            const lineWidth = makeBold ? 2 : 1;
            const background = makeBold ? "#AAAAAA" : "#EEEEEE";
            return (
              <SmallGridLineY
                key={i}
                height={height}
                width={lineWidth}
                left={(i * height) / 9 - lineWidth / 2}
                background={background}
              />
            );
          })}
          {sudoku.map((c, i) => {
            const onClick = e => {
              if (!c.initial) {
                this.exitNotesMode();
                this.props.showMenu(c);
                e.preventDefault();
                e.stopPropagation();
              }
            };
            const position = positionedCells[i];
            const conflicted = conflicting[i];

            const notes = showHints
              ? conflicted.possibilities
              : [...c.notes.values()];

            const inConflictPath = pathCells.find(d => {
              return d.x === c.x && d.y === c.y;
            });

            return (
              <div key={i}>
                <GridCell
                  highlight={inConflictPath}
                  style={{
                    position: "absolute",
                    height: ySection,
                    width: xSection,
                    left: xSection * c.x,
                    top: ySection * c.y,
                    zIndex: 0
                  }}
                  onClick={onClick}
                />
                <GridCellNumber
                  left={position.x}
                  top={position.y}
                  initial={c.initial}
                >
                  {c.number}
                </GridCellNumber>
                <CellNoteContainer
                  style={{
                    left: xSection * c.x,
                    top: ySection * c.y,
                    fontWeight: c.initial ? "bold" : "normal",
                    width: xSection,
                    height: ySection
                  }}
                >
                  {c.initial || c.number
                    ? null
                    : notes.map(n => {
                        const notePosition = state.getNotePosition(n);
                        return (
                          <CellNote
                            key={n}
                            style={{
                              left: notePosition.x,
                              top: notePosition.y
                            }}
                          >
                            {n}
                          </CellNote>
                        );
                      })}
                </CellNoteContainer>
              </div>
            );
          })}
          {activeCell ? (
            <div
              style={{
                position: "absolute",
                top: ySection * selectionPosition.y,
                left: xSection * selectionPosition.x,
                height: ySection,
                width: xSection
              }}
            >
              <MenuWrapper>
                <SudokuMenu
                  enterNotesMode={this.enterNotesMode}
                  exitNotesMode={this.exitNotesMode}
                  notesMode={this.state.notesMode}
                  cell={activeCell}
                />
              </MenuWrapper>
            </div>
          ) : null}
        </SudokuSmall>
      </div>
    );
  }
}

export const SudokuConnected = connect<
  SudokuComponentStateProps,
  SudokuComponentDispatchProps,
  SudokuComponentOwnProps
>(
  (state: RootState) => {
    return {
      showMenuForCell: state.game.showMenu,
      showHints: state.game.showHints,
      sudoku: state.sudoku.grid
    };
  },
  { showMenu }
)(SudokuComponent);
