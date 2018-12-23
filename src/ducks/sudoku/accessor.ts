import * as _ from "lodash";
import {SUDOKU_NUMBERS, Cell} from "src/engine/utility";

export interface CellIndexed extends Cell {
  index: number;
}

export interface PositionedCell {
  cell: Cell;
  x: number;
  y: number;
}

export interface NoteCell {
  x: number;
  y: number;
  note: number;
}

export interface ConflictingCell {
  cell: CellIndexed;
  conflicting: CellIndexed[];
  possibilities: number[];
}

export interface ConflictingPath {
  from: Cell;
  to: Cell;
  index: number;
}

export default class SudokuState {
  width: number;
  height: number;

  constructor() {
    this.getCellPosition = this.getCellPosition.bind(this);
  }

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
      const str = [`${fromCell.x}-${fromCell.y}`, `${toCell.x}-${toCell.y}`].sort().join("-");
      return str;
    });
  }

  getPathBetweenCell(c1: Cell, c2: Cell) {
    const {x: x1, y: y1} = c1;
    const {x: x2, y: y2} = c2;

    const inc = x1 > x2 ? -1 : 1;
    const xpath = [];
    for (let x = x1; x !== x2; x += inc) {
      xpath.push({x, y: y1});
    }
    const inc2 = y1 > y2 ? -1 : 1;
    const ypath = [];
    for (let y = y1; y !== y2; y += inc2) {
      ypath.push({x: x2, y});
    }
    ypath.push({x: x2, y: y2});

    return xpath.concat(ypath);
  }

  getNotePosition(n: number) {
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

    // we use percentage
    const noteWidth = 100;
    const noteHeight = 100;

    const {x, y} = positions[n];

    return {
      x: (noteWidth / 3) * (x + 0.5),
      y: (noteHeight / 3) * (y + 0.5),
      note: n,
    };
  }

  isSolved(sudoku: Cell[]): Boolean {
    if (!sudoku) {
      return false;
    }
    const noConflicts = this.correct(sudoku);
    const set = sudoku.filter(c => c.number !== 0);
    const allSet = set.length === sudoku.length;
    return allSet && noConflicts;
  }

  getCellPosition(c: Cell): PositionedCell {
    const fontXOffset = this.xSection / 2;
    const fontYOffset = this.ySection / 2;
    return {
      x: this.xSection * c.x + fontXOffset,
      y: this.ySection * c.y + fontYOffset,
      cell: c,
    };
  }

  positionedCells(sudoku: Cell[]): PositionedCell[] {
    return sudoku.map(this.getCellPosition);
  }

  correct(sudoku: Cell[]): Boolean {
    if (!sudoku) {
      return false;
    }
    const sudokuFiltered = sudoku.filter(c => c.number !== 0);
    const rows = Object.values(
      _.groupBy(sudokuFiltered, c => {
        return c.x;
      }),
    );
    const columns = Object.values(
      _.groupBy(sudokuFiltered, c => {
        return c.y;
      }),
    );
    const squares = Object.values(
      _.groupBy(sudokuFiltered, c => {
        return `${Math.floor(c.x / 3)}-${Math.floor(c.y / 3)}`;
      }),
    );
    const correctRows = rows.every(row => _.uniqBy(row, r => r.number).length === row.length);
    const correctColumns = columns.every(row => _.uniqBy(row, r => r.number).length === row.length);
    const correctSquares = squares.every(row => _.uniqBy(row, r => r.number).length === row.length);
    return correctRows && correctColumns && correctSquares;
  }

  conflictingFields(sudoku: Cell[]): ConflictingCell[] {
    const sudokuWithIndex: CellIndexed[] = sudoku.map((c, i) => ({
      ...c,
      index: i,
    }));

    return sudokuWithIndex.map(cell => {
      const rowCells = sudokuWithIndex.filter(c => c.x === cell.x);
      const columnCells = sudokuWithIndex.filter(c => c.y === cell.y);
      const squares = Object.values(
        _.groupBy(sudokuWithIndex, c => {
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
        .filter(c => c.number !== 0);

      const otherNumbers = _.uniq(all.map(c => c.number));
      const possibilities = SUDOKU_NUMBERS.filter(n => !otherNumbers.includes(n));

      return {
        cell,
        conflicting: all,
        possibilities,
      };
    });
  }

  getPathsFromConflicting(conflictingCell: ConflictingCell, sudoku: Cell[]): ConflictingPath[] {
    const {conflicting, cell} = conflictingCell;
    const paths = [];
    conflicting.forEach(c => {
      const targetPosition = sudoku[c.index];
      const fromPosition = sudoku[cell.index];
      if (c.number === cell.number && c.index !== cell.index) {
        const path: ConflictingPath = {
          from: fromPosition,
          to: targetPosition,
          index: c.index,
        };
        paths.push(path);
      }
    });

    return paths;
  }
}
