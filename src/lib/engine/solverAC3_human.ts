import {SQUARE_TABLE, SUDOKU_NUMBERS, squareIndex} from "./utility";
import {SimpleSudoku} from "./types";
import {solveBacktracking} from "./solverBacktracking_human";

export type DomainSudoku = number[][][];

function toSimpleSudoku(grid: DomainSudoku): SimpleSudoku {
  return grid.map((row) => row.map((cells) => (cells.length === 1 ? cells[0] : 0)));
}

function toDomainSudoku(grid: SimpleSudoku): DomainSudoku {
  return grid.map((row) => row.map((c) => (c === 0 ? SUDOKU_NUMBERS.slice() : [c])));
}

function ac3(sudoku: DomainSudoku): {
  sudoku: DomainSudoku;
  solvable: boolean;
} {
  sudoku = sudoku.map((r) => r.map((c) => c.slice()));
  // Single constraint-propagation pass (matches the paper's iteration counts).
  for (let y = 0; y < 9; y++) {
    const row = sudoku[y];
    for (let x = 0; x < 9; x++) {
      const domain1 = row[x];

      // Cells in the same row, column, and 3x3 square that constrain this cell (without duplicates).
      const coordinates: [number, number][] = [];
      for (let xx = 0; xx < 9; xx++) {
        if (xx !== x) {
          coordinates.push([y, xx]);
        }
      }
      for (let yy = 0; yy < 9; yy++) {
        if (yy !== y) {
          coordinates.push([yy, x]);
        }
      }
      const square = SQUARE_TABLE[squareIndex(x, y)];
      for (let c = 0; c < 9; c++) {
        const [xx, yy] = square[c];
        if (xx !== x && yy !== y) {
          coordinates.push([yy, xx]);
        }
      }

      for (const [yy, xx] of coordinates) {
        const domain2 = sudoku[yy][xx];
        // For inequality constraints, pruning happens only when the peer domain is fixed to one value.
        if (domain2.length === 1) {
          const index = domain1.indexOf(domain2[0]);
          if (index !== -1) {
            domain1.splice(index, 1);
          }
        }
      }

      if (domain1.length === 0) {
        return {sudoku, solvable: false};
      }
    }
  }
  return {sudoku, solvable: true};
}

function findMinRemainingValueCell(grid: DomainSudoku): [number, number] | null {
  let bestRow = -1;
  let bestCol = -1;
  let bestLength = Infinity;

  for (let r = 0; r < 9; r++) {
    const row = grid[r];
    for (let c = 0; c < 9; c++) {
      const len = row[c].length;
      if (len > 1 && len < bestLength) {
        bestLength = len;
        bestRow = r;
        bestCol = c;
        if (len === 2) {
          return [bestRow, bestCol];
        }
      }
    }
  }

  return bestRow === -1 ? null : [bestRow, bestCol];
}

/**
 * For more information see the paper
 * Rating and Generating Sudoku Puzzles Based On Constraint Satisfaction Problems
 * by Bahare Fatemi, Seyed Mehran Kazemi, Nazanin Mehrasa
 */
export function _solveGridAC3(
  stack: DomainSudoku[] = [],
  iterations: number,
): {
  sudoku: SimpleSudoku | null;
  iterations: number;
} {
  while (stack.length > 0) {
    let [grid, ...rest] = stack;

    iterations++;
    // Evil puzzles average ~500 iterations; anything beyond 4000 falls back to backtracking.
    if (iterations > 4000) {
      return {
        sudoku: toSimpleSudoku(grid),
        iterations: Infinity,
      };
    }

    const {sudoku: newGrid, solvable} = ac3(grid);
    if (!solvable) {
      stack = rest;
      continue;
    }
    grid = newGrid;

    // Pick the first cell with the fewest remaining candidates (MRV heuristic).
    const nextCell = findMinRemainingValueCell(grid);
    if (nextCell === null) {
      return {
        sudoku: toSimpleSudoku(grid),
        iterations,
      };
    }

    const [rowIndex, cellIndex] = nextCell;
    const cell = grid[rowIndex][cellIndex];
    const newGrids = cell.map((n) =>
      grid.map((row, r) =>
        r === rowIndex ? row.map((cells, c) => (c === cellIndex ? [n] : cells.slice())) : row.slice(),
      ),
    );
    stack = newGrids.concat(rest);
  }

  return {
    sudoku: null,
    iterations: Infinity,
  };
}

export function solve(grid: SimpleSudoku): {
  sudoku: SimpleSudoku | null;
  iterations: number;
} {
  const stack = [toDomainSudoku(grid)];
  const result = _solveGridAC3(stack, 0);
  // Only fall back to backtracking when AC3 hit its iteration limit (not when it proved unsolvability).
  if (result.sudoku !== null && result.iterations === Infinity) {
    return solveBacktracking(grid);
  }

  return result;
}
