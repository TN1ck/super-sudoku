import {hasBoardShape, SUDOKU_NUMBERS, sharesUnit} from "src/lib/engine/utility";
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

const EMPTY_NOTES: number[] = [];

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

  static getNotePosition(n: number): NoteCell {
    const clamped = SUDOKU_NUMBERS.includes(n) ? n : 1;
    const x = (clamped - 1) % 3;
    const y = Math.floor((clamped - 1) / 3);

    return {
      x: (100 / 3) * (x + 0.5),
      y: (100 / 3) * (y + 0.5),
      note: n,
    };
  }

  static isSolved(sudoku: Cell[]): boolean {
    return Boolean(
      sudoku?.every((c) => SUDOKU_NUMBERS.includes(c.number)) && hasBoardShape(sudoku) && this.correct(sudoku),
    );
  }

  static getCellPosition(c: Cell, width: number, height: number): PositionedCell {
    const xSection = width / 9;
    const ySection = height / 9;
    return {
      x: xSection * (c.x + 0.5),
      y: ySection * (c.y + 0.5),
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
    if (cell.number !== 0) {
      return EMPTY_NOTES;
    }
    if (!showHints || cell.autoNotesHidden || cell.notes.length > 0) {
      return cell.notes;
    }
    const occupied = new Set<number>();
    for (const other of sudoku) {
      if (other.number !== 0 && (other.x !== cell.x || other.y !== cell.y) && sharesUnit(cell, other)) {
        occupied.add(other.number);
      }
    }
    const candidates = SUDOKU_NUMBERS.filter((number) => !occupied.has(number));
    return candidates.length > 0 ? candidates : EMPTY_NOTES;
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
