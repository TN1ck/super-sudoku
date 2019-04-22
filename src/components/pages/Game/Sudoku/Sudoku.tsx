import * as React from "react";
import {showMenu, selectCell, hideMenu} from "src/ducks/game";

import SudokuMenuCircle, {MenuWrapper, MenuContainer} from "./SudokuMenuCircle";
import {
  GridLineX,
  GridCell,
  GridLineY,
  GridCellNumber,
  CellNote,
  CellNoteContainer,
  SudokuContainer,
} from "src/components/pages/Game/Sudoku/Sudoku.styles";
import SudokuGame from "src/engine/game";
import {Bounds} from "src/utils/types";
import {Cell, CellCoordinates} from "src/engine/utility";
import {flatten} from "src/utils/collection";

const SudokuGrid: React.StatelessComponent<{width: number; height: number; hideLeftRight?: boolean}> = ({
  width,
  height,
  hideLeftRight = false,
}) => {
  return (
    <div>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
        const hide = [0, 9].includes(i);
        if (hideLeftRight && hide) {
          return null;
        }
        const makeBold = [3, 6].includes(i);
        return <GridLineX makeBold={makeBold} key={i} width={width} top={(i * height) / 9} />;
      })}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
        const hide = [0, 9].includes(i);
        if (hideLeftRight && hide) {
          return null;
        }
        const makeBold = [3, 6].includes(i);
        return <GridLineY makeBold={makeBold} key={i} height={height} left={(i * height) / 9} />;
      })}
    </div>
  );
};

const SudokuCell: React.StatelessComponent<{
  number: number;
  active: boolean;
  highlightNumber: boolean;
  highlight: boolean;
  conflict: boolean;
  bounds: Bounds;
  onClick: (e) => void;
  onRightClick: (e) => void;
  top: number;
  left: number;
  initial: boolean;
  notes: number[];
  notesMode: boolean;
}> = ({
  number,
  active,
  highlight,
  bounds,
  onClick,
  onRightClick,
  left,
  top,
  initial,
  notes,
  notesMode,
  conflict,
  highlightNumber,
}) => {
  return (
    <div>
      <GridCell
        notesMode={notesMode}
        active={active}
        conflict={conflict}
        highlight={highlight}
        highlightNumber={highlightNumber}
        bounds={bounds}
        onClick={onClick}
        onContextMenu={onRightClick}
      />
      <GridCellNumber left={left} top={top} initial={initial} highlight={highlightNumber}>
        {number !== 0 ? number : ""}
      </GridCellNumber>
      <CellNoteContainer initial={initial} bounds={bounds}>
        {initial || number
          ? null
          : notes.map(n => {
              const notePosition = SudokuGame.getNotePosition(n);
              return (
                <CellNote key={n} left={notePosition.x} top={notePosition.y}>
                  {n !== 0 ? n : ""}
                </CellNote>
              );
            })}
      </CellNoteContainer>
    </div>
  );
};

interface SudokuProps {
  activeCell: CellCoordinates;
  sudoku: Cell[];
  showHints: boolean;
  shouldShowMenu: boolean;
  notesMode: boolean;
  showMenu: typeof showMenu;
  hideMenu: typeof hideMenu;
  selectCell: typeof selectCell;
}

export class Sudoku extends React.PureComponent<SudokuProps> {
  _isMounted: boolean = false;
  element: HTMLElement;
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this._isMounted = true;
    window.addEventListener("click", () => {
      if (this.props.activeCell !== null) {
        this.props.hideMenu();
      }
    });
  }

  render() {
    const {sudoku, showHints} = this.props;
    const height = 100;
    const width = 100;

    const xSection = height / 9;
    const ySection = width / 9;

    const activeCell =
      this.props.activeCell && sudoku.find(c => c.x === this.props.activeCell.x && c.y === this.props.activeCell.y);
    const selectionPosition = {
      x: (activeCell && activeCell.x) || 0,
      y: (activeCell && activeCell.y) || 0,
    };

    const positionedCells = SudokuGame.positionedCells(sudoku, width, height);
    const conflicting = SudokuGame.conflictingFields(sudoku);
    const uniquePaths = SudokuGame.uniquePaths(
      flatten(
        conflicting.map(c => {
          return SudokuGame.getPathsFromConflicting(c, sudoku);
        }),
      ),
    );

    const pathCells = flatten(
      uniquePaths.map(p => {
        return SudokuGame.getPathBetweenCell(p.from, p.to);
      }),
    );

    const friendsOfActiveCell = activeCell ? SudokuGame.sameSquareColumnRow(activeCell, sudoku) : [];

    const onRightClickOnOpenMenu = e => {
      if (activeCell && this.props.shouldShowMenu) {
        this.props.selectCell(activeCell);
        this.props.showMenu(true);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    return (
      <SudokuContainer>
        <SudokuGrid width={width} height={height} hideLeftRight />
        {sudoku.map((c, i) => {
          const onClick = e => {
            this.props.selectCell(c);
            if (!c.initial) {
              this.props.showMenu();
            }
            e.preventDefault();
            e.stopPropagation();
          };
          1;
          const onRightClick = e => {
            this.props.selectCell(c);
            if (!c.initial) {
              this.props.showMenu(true);
            }
            e.preventDefault();
            e.stopPropagation();
          };
          const position = positionedCells[i];
          const conflicted = conflicting[i];

          const notes = showHints ? conflicted.possibilities : [...c.notes.values()];

          const inConflictPath = pathCells.some(d => {
            return d.x === c.x && d.y === c.y;
          });

          const bounds: Bounds = {
            width: xSection,
            height: ySection,
            left: xSection * c.x,
            top: ySection * c.y,
          };

          const isActive = activeCell ? c.x === activeCell.x && c.y === activeCell.y : false;
          const highlight = friendsOfActiveCell.some(cc => {
            return cc.x === c.x && cc.y === c.y;
          });
          const highlightNumber = activeCell && c.number !== 0 ? activeCell.number === c.number : false;

          return (
            <SudokuCell
              key={i}
              active={isActive}
              highlight={highlight}
              highlightNumber={highlightNumber && !isActive}
              conflict={inConflictPath}
              bounds={bounds}
              onClick={onClick}
              onRightClick={onRightClick}
              left={position.x}
              top={position.y}
              notes={notes}
              number={c.number}
              initial={c.initial}
              notesMode={this.props.notesMode}
            />
          );
        })}
        {activeCell && this.props.shouldShowMenu ? (
          <MenuContainer
            onContextMenu={onRightClickOnOpenMenu}
            bounds={{
              top: ySection * selectionPosition.y,
              left: xSection * selectionPosition.x,
              height: ySection,
              width: xSection,
            }}
          >
            <MenuWrapper>
              <SudokuMenuCircle cell={activeCell} />
            </MenuWrapper>
          </MenuContainer>
        ) : null}
      </SudokuContainer>
    );
  }
}
