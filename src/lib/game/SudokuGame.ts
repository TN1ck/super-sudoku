import {SUDOKU_NUMBERS, sharesUnit} from "src/lib/engine/utility";
import {Cell} from "src/lib/engine/types";

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

export default class SudokuGame {
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
    return Boolean(sudoku && sudoku.every((cell) => cell.number !== 0) && this.correct(sudoku));
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
    return Boolean(sudoku && this.conflictingPaths(sudoku).length === 0);
  }

  static visibleNotes(cell: Cell, sudoku: Cell[], showHints: boolean): number[] {
    if (!showHints || cell.notes.length > 0) {
      return cell.notes;
    }
    const occupied = sudoku
      .filter((other) => (other.x !== cell.x || other.y !== cell.y) && sharesUnit(cell, other))
      .map((other) => other.number);
    return SUDOKU_NUMBERS.filter((number) => !occupied.includes(number));
  }

  static toggleNote(cell: Cell, visibleNotes: number[], number: number): number[] {
    // Removing a suggestion keeps the others. Adding a number starts or extends the player's own notes.
    return visibleNotes.includes(number) ? visibleNotes.filter((note) => note !== number) : [...cell.notes, number];
  }

  static conflictingPaths(sudoku: Cell[]): {from: Cell; to: Cell}[] {
    const filled = sudoku.filter((cell) => cell.number !== 0);
    const paths = [];
    for (const [i, from] of filled.entries()) {
      for (let j = i + 1; j < filled.length; j++) {
        const to = filled[j];
        if (from.number === to.number && sharesUnit(from, to)) {
          paths.push({from, to});
        }
      }
    }
    return paths;
  }
}
