import {SQUARE_TABLE, SUDOKU_NUMBERS, squareIndex} from "./utility";
import {SimpleSudoku} from "./types";
import sortBy from "lodash-es/sortBy";

export type DomainSudoku = number[][][];

// function removeValuesFromDomain(domain1: number[], domain2: number[]): [number[], boolean] {
//   let change = false;
//   // this is an optimization:
//   // AC3 checks if there is a value in domain1 that
//   // does not comply the constraint with at least one value in domain2.
//   // But because the constraint is inequality, the case happens only
//   // when the domain2 is just one variable. The <= is just a safe-check.
//   if (domain2.length <= 1) {
//     const index = domain1.indexOf(domain2[0]);
//     if (index !== -1) {
//       domain1 = domain1.slice();
//       domain1.splice(index, 1);
//       change = true;
//     }
//   }
//   return [domain1, change];
// }

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

function ac3(sudoku: DomainSudoku): {
  sudoku: DomainSudoku;
  solvable: boolean;
} {
  sudoku = sudoku.map((r) => r.map((c) => c.slice()));
  // Loop until no changes are made to any domain of any cell.
  // The original paper did not do this, as the iteration counts do not match.
  // I still leave it here, but do not use it.
  while (true) {
    let change = false;
    // We don't keep an actual set of constraints as some AC3 algorithm explanations do it.
    // Sudoku has very well defined constraints, we can use loops to check the constraints.
    for (let y = 0; y < 9; y++) {
      const row = sudoku[y];
      for (let x = 0; x < 9; x++) {
        let domain1 = row[x];

        // The coordinates of the cells that have a constraint with the
        // the current cell.
        const coordinates: [number, number][] = [];
        // Cells in the same row.
        for (let xx = 0; xx < 9; xx++) {
          if (xx === x) {
            continue;
          }
          coordinates.push([y, xx]);
        }

        // Cells in the same column.
        for (let yy = 0; yy < 9; yy++) {
          if (yy === y) {
            continue;
          }
          coordinates.push([yy, x]);
        }

        // Cells in the same square.
        const square = SQUARE_TABLE[squareIndex(x, y)];
        for (let c = 0; c < 9; c++) {
          const s = square[c];
          const [xx, yy] = s;
          if (xx === x && yy === y) {
            continue;
          }
          coordinates.push([yy, xx]);
        }

        for (const [yy, xx] of coordinates) {
          const domain2 = sudoku[yy][xx];

          // If domain2 consists of only one number, remove it from domain1.
          //
          // This is an optimization of AC3:
          // AC3 checks if there is a value in domain1 that
          // does not comply the constraint with at least one value in domain2.
          // But because the constraint for sudoku is inequality, the case happens only
          // when the domain2 is just one variable.
          let changed = false;
          if (domain2.length === 1) {
            const index = domain1.indexOf(domain2[0]);
            if (index !== -1) {
              domain1.splice(index, 1);
              changed = true;
            }
          }

          change = change || changed;
          sudoku[y][x] = domain1;
        }

        // A domain became empty (e.g. no value works for a cell), we can't solve this Sudoku,
        // continue with the next one.
        if (domain1.length === 0) {
          return {sudoku, solvable: false};
        }
      }
    }
    // Note: For "proper" AC3, we wouldn't simply just loop, but only add the constraints to check again if a change was made.
    // The result is the same, we might do a few more comparisons, but it is easier to implement.
    // TODO: I initially didn't count the ac3 iterations as proposed by the paper.
    // But using them now falsifies the tests.
    change = false;
    if (!change) {
      break;
    }
  }
  return {sudoku, solvable: true};
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
    // evil puzzles have an average of about 500, everything more than 1000 that is actually solvable
    // will be too impossible for the normal user
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
            return cells.slice();
          });
        }
        return row.slice();
      });
    });
    // The new stack is put first and we recursively descend.
    const newStack = newGrids.concat(rest);
    stack = newStack;
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
  return _solveGridAC3(stack, 0);
}
