import {SQUARE_TABLE, SUDOKU_NUMBERS, squareIndex} from "./utility";
import {DomainSudoku, SimpleSudoku} from "./types";
import {sortBy} from "lodash";

function removeValuesFromDomain(domain1: number[], domain2: number[]): [number[], boolean] {
  let change = false;
  // this is an optimization:
  // AC3 checks if there is a value in domain1 that
  // does not comply the constraint with at least one value in domain2.
  // But because the constraint is inequality, the case happens only
  // when the domain2 is just one variable. The <= is just a safe-check.
  if (domain2.length <= 1) {
    const index = domain1.indexOf(domain2[0]);
    if (index !== -1) {
      domain1 = [].concat(domain1);
      domain1.splice(index, 1);
      change = true;
    }
  }
  return [domain1, change];
}

function toSimpleSudoku(grid: DomainSudoku): SimpleSudoku {
  return grid.map((row) => {
    return row.map((cells) => {
      return cells.length === 1 ? cells[0] : 0;
    });
  });
}

function toDomainSudoku(grid: SimpleSudoku): DomainSudoku {
  return grid.map((row) => {
    return row.map((c) => {
      return c === 0 ? SUDOKU_NUMBERS : [c];
    });
  });
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
  sudoku: SimpleSudoku;
  iterations: number;
} {
  if (stack.length === 0) {
    return {
      sudoku: null,
      iterations: Infinity,
    };
  }

  const [grid, ...rest] = stack;

  iterations++;
  // evil puzzles have an average of about 500, everything more than 1000 that is actually solvable
  // will be too impossible for the normal user
  if (iterations > 1000) {
    return {
      sudoku: toSimpleSudoku(grid),
      iterations: Infinity,
    };
  }

  const rows = grid;

  // add row column constraints
  for (let y = 0; y < 9; y++) {
    const row = rows[y];
    for (let x = 0; x < 9; ) {
      let domain1 = row[x];
      let change = false;
      // I tried to be clever and tried not to compare cells twice
      // but this is will falsify the algorithm
      for (let xx = 0; xx < 9; xx++) {
        if (xx === x) {
          continue;
        }
        const domain2 = row[xx];
        const result = removeValuesFromDomain(domain1, domain2);
        domain1 = result[0];
        change = result[1];
        row[x] = domain1;
      }

      for (let yy = 0; yy < 9; yy++) {
        if (yy === y) {
          continue;
        }
        const domain2 = rows[yy][x];
        const result = removeValuesFromDomain(domain1, domain2);
        domain1 = result[0];
        change = change || result[1];
        row[x] = domain1;
      }

      const square = SQUARE_TABLE[squareIndex(x, y)];
      for (let c = 0; c < 9; c++) {
        const s = square[c];
        const [xx, yy] = s;
        if (xx === x && yy === y) {
          continue;
        }
        const domain2 = rows[yy][xx];
        const result = removeValuesFromDomain(domain1, domain2);
        domain1 = result[0];
        change = change || result[1];
        row[x] = domain1;
      }

      if (change || domain1.length === 0) {
        if (domain1.length === 0) {
          return _solveGridAC3(rest, iterations);
        }
        // we loop again and simulate the adding of the edges
      } else {
        x++;
      }
    }
  }

  const isFilled = grid.every((row) => {
    return row.every((cells) => {
      return cells.length === 1;
    });
  });

  // Every domain is length 1, we found a solution!
  if (isFilled) {
    return {
      sudoku: toSimpleSudoku(grid),
      iterations,
    };
  }

  // No solution found yet. We create a list of all cells that have more than 1 solution as x/y coordinates.
  const possibleRowAndCells = grid.reduce((current: Array<[number, number]>, row, index) => {
    const possibleCells = row.reduce((currentCells: Array<[number, number]>, cells, cellIndex) => {
      if (cells.length > 1) {
        return currentCells.concat([[index, cellIndex]]);
      }
      return currentCells;
    }, []);
    return current.concat(possibleCells);
  }, []);
  // We sort the possible cells to have the ones with the least possibilities be first.
  // This is called "Minimum remaining value" and is a very good heuristic. It is similar to how
  // humans solve Sudokus.
  const sortedPossibleRowAndCells = sortBy(possibleRowAndCells, ([rowIndex, cellIndex]) => {
    return grid[rowIndex][cellIndex].length;
  });
  // Take the best cell and create a new grid for every possibility the cell has.
  const [rowIndex, cellIndex] = sortedPossibleRowAndCells[0];
  const cell = grid[rowIndex][cellIndex];
  const newGrids = cell.map((n) => {
    return grid.map((row, r) => {
      if (r === rowIndex) {
        return row.map((cells, c) => {
          if (c === cellIndex) {
            return [n];
          }
          return [].concat(cells);
        });
      }
      return [].concat(row);
    });
  });
  // The new stack is put first and we recursively descend.
  const newStack = newGrids.concat(rest);
  return _solveGridAC3(newStack, iterations);
}

export function solve(grid: SimpleSudoku): {
  sudoku: SimpleSudoku;
  iterations: number;
} {
  const stack = [toDomainSudoku(grid)];
  return _solveGridAC3(stack, 0);
}
