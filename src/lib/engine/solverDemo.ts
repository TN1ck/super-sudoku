import {SimpleSudoku} from "./types";
import {SUDOKU_NUMBERS} from "./utility";

export type SolverDemoStrategy = "brute-force" | "skip-invalid" | "mrv";

export type SolverDemoStatus = "running" | "solved" | "failed" | "max-iterations";

export interface SolverDemoState {
  currentGrid: SimpleSudoku;
  stack: SimpleSudoku[];
  iterations: number;
  status: SolverDemoStatus;
}

export interface SolverDemoStepOptions {
  strategy: SolverDemoStrategy;
  maxIterations: number;
}

const cloneSudoku = (grid: SimpleSudoku): SimpleSudoku => grid.map((row) => row.slice());

const isComplete = (grid: SimpleSudoku): boolean => grid.every((row) => row.every((n) => n !== 0));

const isValidValue = (grid: SimpleSudoku, row: number, col: number, value: number): boolean => {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === value && i !== col) {
      return false;
    }
    if (grid[i][col] === value && i !== row) {
      return false;
    }
  }

  const rowBase = Math.floor(row / 3) * 3;
  const colBase = Math.floor(col / 3) * 3;
  for (let y = rowBase; y < rowBase + 3; y++) {
    for (let x = colBase; x < colBase + 3; x++) {
      if (y === row && x === col) {
        continue;
      }
      if (grid[y][x] === value) {
        return false;
      }
    }
  }

  return true;
};

const isGridValid = (grid: SimpleSudoku): boolean => {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const value = grid[y][x];
      if (value === 0) {
        continue;
      }
      if (!isValidValue(grid, y, x, value)) {
        return false;
      }
    }
  }
  return true;
};

const findFirstEmpty = (grid: SimpleSudoku): [number, number] | null => {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (grid[y][x] === 0) {
        return [y, x];
      }
    }
  }
  return null;
};

const validCandidates = (grid: SimpleSudoku, row: number, col: number): number[] => {
  return SUDOKU_NUMBERS.filter((n) => isValidValue(grid, row, col, n));
};

const findCellByMRV = (grid: SimpleSudoku): [number, number] | null => {
  let best: [number, number] | null = null;
  let bestCount = Number.POSITIVE_INFINITY;

  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (grid[y][x] !== 0) {
        continue;
      }
      const count = validCandidates(grid, y, x).length;
      if (count < bestCount) {
        best = [y, x];
        bestCount = count;
      }
    }
  }

  return best;
};

const findNextCell = (grid: SimpleSudoku, strategy: SolverDemoStrategy): [number, number] | null => {
  if (strategy === "mrv") {
    return findCellByMRV(grid);
  }
  return findFirstEmpty(grid);
};

const createCandidates = (grid: SimpleSudoku, row: number, col: number, strategy: SolverDemoStrategy): number[] => {
  if (strategy === "brute-force") {
    return SUDOKU_NUMBERS;
  }
  return validCandidates(grid, row, col);
};

export function createSolverDemoState(initial: SimpleSudoku): SolverDemoState {
  const start = cloneSudoku(initial);
  return {
    currentGrid: start,
    stack: [start],
    iterations: 0,
    status: "running",
  };
}

export function stepSolverDemo(state: SolverDemoState, options: SolverDemoStepOptions): SolverDemoState {
  if (state.status !== "running") {
    return state;
  }

  if (state.iterations >= options.maxIterations) {
    return {
      ...state,
      status: "max-iterations",
    };
  }

  if (state.stack.length === 0) {
    return {
      ...state,
      status: "failed",
    };
  }

  const [grid, ...rest] = state.stack;
  const iterations = state.iterations + 1;

  if (options.strategy !== "brute-force" && !isGridValid(grid)) {
    return {
      ...state,
      currentGrid: grid,
      stack: rest,
      iterations,
      status: rest.length === 0 ? "failed" : "running",
    };
  }

  if (isComplete(grid)) {
    if (isGridValid(grid)) {
      return {
        ...state,
        currentGrid: grid,
        stack: [grid],
        iterations,
        status: "solved",
      };
    }
    return {
      ...state,
      currentGrid: grid,
      stack: rest,
      iterations,
      status: rest.length === 0 ? "failed" : "running",
    };
  }

  const nextCell = findNextCell(grid, options.strategy);
  if (nextCell === null) {
    return {
      ...state,
      currentGrid: grid,
      stack: rest,
      iterations,
      status: rest.length === 0 ? "failed" : "running",
    };
  }

  const [row, col] = nextCell;
  const candidates = createCandidates(grid, row, col, options.strategy);
  const newGrids = candidates.map((candidate) => {
    const nextGrid = cloneSudoku(grid);
    nextGrid[row][col] = candidate;
    return nextGrid;
  });

  return {
    ...state,
    currentGrid: grid,
    stack: newGrids.concat(rest),
    iterations,
    status: newGrids.length === 0 && rest.length === 0 ? "failed" : "running",
  };
}
