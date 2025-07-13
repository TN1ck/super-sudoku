import groupBy from "lodash-es/groupBy";
import uniq from "lodash-es/uniq";
import uniqBy from "lodash-es/uniqBy";
import {SUDOKU_NUMBERS} from "src/lib/engine/utility";
import {Cell} from "src/lib/engine/types";

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

export default class SudokuGame {
  static uniquePaths(paths: ConflictingPath[]) {
    return uniqBy(paths, (p) => {
      const fromCell = p.from;
      const toCell = p.to;
      const str = [`${fromCell.x}-${fromCell.y}`, `${toCell.x}-${toCell.y}`].sort().join("-");
      return str;
    });
  }

  static getPathBetweenCell(c1: Cell, c2: Cell) {
    const {x: x1, y: y1} = c1;
    const {x: x2, y: y2} = c2;

    const inc = x1 > x2 ? -1 : 1;
    const xpath: Array<{x: number; y: number}> = [];
    for (let x = x1; x !== x2; x += inc) {
      xpath.push({x, y: y1});
    }
    const inc2 = y1 > y2 ? -1 : 1;
    const ypath: Array<{x: number; y: number}> = [];
    for (let y = y1; y !== y2; y += inc2) {
      ypath.push({x: x2, y});
    }
    ypath.push({x: x2, y: y2});

    return xpath.concat(ypath);
  }

  static getNotePosition(n: number) {
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

  static isSolved(sudoku: Cell[]): boolean {
    if (!sudoku) {
      return false;
    }
    const noConflicts = this.correct(sudoku);
    const set = sudoku.filter((c) => c.number !== 0);
    const allSet = set.length === sudoku.length;
    return allSet && noConflicts;
  }

  static getCellPosition(c: Cell, width: number, height: number): PositionedCell {
    const xSection = height / 9;
    const ySection = width / 9;
    const fontXOffset = xSection / 2;
    const fontYOffset = ySection / 2;
    return {
      x: xSection * c.x + fontXOffset,
      y: ySection * c.y + fontYOffset,
      cell: c,
    };
  }

  static positionedCells(sudoku: Cell[], width: number, height: number): PositionedCell[] {
    return sudoku.map((c) => this.getCellPosition(c, width, height));
  }

  static correct(sudoku: Cell[]): boolean {
    if (!sudoku) {
      return false;
    }
    const sudokuFiltered = sudoku.filter((c) => c.number !== 0);
    const rows = Object.values(
      groupBy(sudokuFiltered, (c) => {
        return c.x;
      }),
    );
    const columns = Object.values(
      groupBy(sudokuFiltered, (c) => {
        return c.y;
      }),
    );
    const squares = Object.values(
      groupBy(sudokuFiltered, (c) => {
        return `${Math.floor(c.x / 3)}-${Math.floor(c.y / 3)}`;
      }),
    );
    const correctRows = rows.every((row) => uniqBy(row, (r) => r.number).length === row.length);
    const correctColumns = columns.every((row) => uniqBy(row, (r) => r.number).length === row.length);
    const correctSquares = squares.every((row) => uniqBy(row, (r) => r.number).length === row.length);
    return correctRows && correctColumns && correctSquares;
  }

  static sameNumber(cell: Cell, sudoku: Cell[]): Cell[] {
    return sudoku.filter((c) => c.number === cell.number);
  }

  static sameSquareColumnRow(cell: Cell, sudoku: Cell[]): Cell[] {
    const column = sudoku.filter((c) => cell.y === c.y);
    const row = sudoku.filter((c) => cell.x === c.x);
    const square = sudoku.filter(
      (c) => Math.floor(c.x / 3) === Math.floor(cell.x / 3) && Math.floor(c.y / 3) === Math.floor(cell.y / 3),
    );
    return [...column, ...row, ...square];
  }

  static conflictingFields(sudoku: Cell[]): ConflictingCell[] {
    const sudokuWithIndex: CellIndexed[] = sudoku.map((c, i) => ({
      ...c,
      index: i,
    }));

    return sudokuWithIndex.map((cell) => {
      const rowCells = sudokuWithIndex.filter((c) => c.x === cell.x);
      const columnCells = sudokuWithIndex.filter((c) => c.y === cell.y);
      const squares = Object.values(
        groupBy(sudokuWithIndex, (c) => {
          return `${Math.floor(c.x / 3)}-${Math.floor(c.y / 3)}`;
        }),
      );
      const squareCells = squares.filter((square) => {
        return square.indexOf(cell) !== -1;
      })[0];

      const all = rowCells
        .concat(columnCells)
        .concat(squareCells)
        .filter((c) => c.index !== cell.index)
        .filter((c) => c.number !== 0);

      const otherNumbers = uniq(all.map((c) => c.number));
      const possibilities = SUDOKU_NUMBERS.filter((n) => !otherNumbers.includes(n));

      return {
        cell,
        conflicting: all,
        possibilities,
      };
    });
  }

  static getPathsFromConflicting(conflictingCell: ConflictingCell, sudoku: Cell[]): ConflictingPath[] {
    const {conflicting, cell} = conflictingCell;
    const paths: ConflictingPath[] = [];
    conflicting.forEach((c) => {
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
