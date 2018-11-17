import * as React from "react";
import {connect} from "react-redux";
import {showMenu} from "src/ducks/game";
import {Cell} from "src/ducks/sudoku/model";

import * as _ from "lodash";

import SudokuMenu, {MenuWrapper, MenuContainer} from "./SudokuMenu";
import {
  GridLineX,
  GridCell,
  GridLineY,
  GridCellNumber,
  CellNote,
  CellNoteContainer,
  SudokuBackground,
  SudokuContainer,
} from "src/components/modules/Sudoku/Sudoku.styles";
import SudokuState from "src/ducks/sudoku/accessor";
import {RootState} from "src/ducks";
import {Bounds} from "src/utils/types";

const fontSize = 14;
// const fontSizeNotes = 11;

interface SudokuComponentStateProps {
  activeCell: Cell;
  sudoku: Cell[];
  showHints: boolean;
}

interface SudokuComponentDispatchProps {
  showMenu: typeof showMenu;
}

interface SudokuComponentOwnProps {}

class SudokuComponent extends React.PureComponent<
  SudokuComponentDispatchProps & SudokuComponentStateProps & SudokuComponentOwnProps,
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
      height: 300,
      width: 300,
      notesMode: false,
    };
    this.setRef = this.setRef.bind(this);
    this.enterNotesMode = this.enterNotesMode.bind(this);
    this.exitNotesMode = this.exitNotesMode.bind(this);
    this.setDimensions = this.setDimensions.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
    window.addEventListener("click", () => {
      if (this.props.activeCell !== null) {
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
    const {sudoku, showHints} = this.props;
    const size = Math.min(this.state.height, this.state.width);
    const height = size;
    const width = size;

    const xSection = height / 9;
    const ySection = width / 9;

    const activeCell =
      this.props.activeCell && sudoku.find(c => c.x === this.props.activeCell.x && c.y === this.props.activeCell.y);
    const selectionPosition = {
      x: (activeCell && activeCell.x) || 0,
      y: (activeCell && activeCell.y) || 0,
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
        }),
      ),
    );

    const pathCells = _.flatten(
      uniquePaths.map(p => {
        return state.getPathBetweenCell(p.from, p.to);
      }),
    );

    return (
      <SudokuContainer ref={this.setRef}>
        <SudokuBackground
          style={{
            fontSize,
            height,
            width,
            lineHeight: fontSize + "px",
          }}
        />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const hide = [0, 9].includes(i);
          if (hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineX makeBold={makeBold} key={i} width={width} top={(i * height) / 9} />;
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const hide = [0, 9].includes(i);
          if (hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineY makeBold={makeBold} key={i} height={height} left={(i * height) / 9} />;
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

          const notes = showHints ? conflicted.possibilities : [...c.notes.values()];

          const inConflictPath = pathCells.find(d => {
            return d.x === c.x && d.y === c.y;
          });

          const bounds: Bounds = {
            width: xSection,
            height: ySection,
            left: xSection * c.x,
            top: ySection * c.y,
          };

          return (
            <div key={i}>
              <GridCell highlight={inConflictPath} bounds={bounds} onClick={onClick} />
              <GridCellNumber left={position.x} top={position.y} initial={c.initial}>
                {c.number}
              </GridCellNumber>
              <CellNoteContainer initial={c.initial} bounds={bounds}>
                {c.initial || c.number
                  ? null
                  : notes.map(n => {
                      const notePosition = state.getNotePosition(n);
                      return (
                        <CellNote key={n} left={notePosition.x} top={notePosition.y}>
                          {n}
                        </CellNote>
                      );
                    })}
              </CellNoteContainer>
            </div>
          );
        })}
        {activeCell ? (
          <MenuContainer
            bounds={{
              top: ySection * selectionPosition.y,
              left: xSection * selectionPosition.x,
              height: ySection,
              width: xSection,
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
          </MenuContainer>
        ) : null}
      </SudokuContainer>
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
      activeCell: state.game.activeCell,
      showHints: state.game.showHints,
      sudoku: state.sudoku.grid,
    };
  },
  {showMenu},
)(SudokuComponent);
