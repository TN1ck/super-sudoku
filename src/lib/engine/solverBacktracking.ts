import {SimpleSudoku} from "./types";
import {SUDOKU_NUMBERS} from "./utility";

interface SolverState {
  board: SimpleSudoku;
  iterations: number;
}

function cloneSudoku(sudoku: SimpleSudoku): SimpleSudoku {
  return sudoku.map((row) => row.slice());
}

function isValidPlacement(board: SimpleSudoku, row: number, column: number, number: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== column && board[row][i] === number) {
      return false;
    }
    if (i !== row && board[i][column] === number) {
      return false;
    }
  }

  const squareRow = Math.floor(row / 3) * 3;
  const squareColumn = Math.floor(column / 3) * 3;
  for (let y = squareRow; y < squareRow + 3; y++) {
    for (let x = squareColumn; x < squareColumn + 3; x++) {
      if ((y !== row || x !== column) && board[y][x] === number) {
        return false;
      }
    }
  }

  return true;
}

function hasValidGivens(board: SimpleSudoku): boolean {
  return board.every((row, y) => {
    return row.every((number, x) => {
      return number === 0 || isValidPlacement(board, y, x, number);
    });
  });
}

function getCandidates(board: SimpleSudoku, row: number, column: number): number[] {
  return SUDOKU_NUMBERS.filter((number) => isValidPlacement(board, row, column, number));
}

function findBestEmptyCell(board: SimpleSudoku): {row: number; column: number; candidates: number[]} | null {
  let bestCell: {row: number; column: number; candidates: number[]} | null = null;

  for (let row = 0; row < 9; row++) {
    for (let column = 0; column < 9; column++) {
      if (board[row][column] !== 0) {
        continue;
      }

      const candidates = getCandidates(board, row, column);
      if (bestCell === null || candidates.length < bestCell.candidates.length) {
        bestCell = {row, column, candidates};
      }

      if (candidates.length <= 1) {
        return bestCell;
      }
    }
  }

  return bestCell;
}

function solveInPlace(state: SolverState): boolean {
  state.iterations++;

  const cell = findBestEmptyCell(state.board);
  if (cell === null) {
    return true;
  }
  if (cell.candidates.length === 0) {
    return false;
  }

  for (const number of cell.candidates) {
    state.board[cell.row][cell.column] = number;
    if (solveInPlace(state)) {
      return true;
    }
    state.board[cell.row][cell.column] = 0;
  }

  return false;
}

function countSolutionsInPlace(
  state: SolverState,
  limit: number,
  solutions: {count: number; firstSolution: SimpleSudoku | null},
): void {
  if (solutions.count >= limit) {
    return;
  }

  state.iterations++;

  const cell = findBestEmptyCell(state.board);
  if (cell === null) {
    solutions.count++;
    solutions.firstSolution = solutions.firstSolution ?? cloneSudoku(state.board);
    return;
  }
  if (cell.candidates.length === 0) {
    return;
  }

  for (const number of cell.candidates) {
    state.board[cell.row][cell.column] = number;
    countSolutionsInPlace(state, limit, solutions);
    state.board[cell.row][cell.column] = 0;

    if (solutions.count >= limit) {
      return;
    }
  }
}

export function solveBacktracking(sudoku: SimpleSudoku): {sudoku: SimpleSudoku | null; iterations: number} {
  const state = {
    board: cloneSudoku(sudoku),
    iterations: 0,
  };

  if (!hasValidGivens(state.board)) {
    return {
      sudoku: null,
      iterations: Infinity,
    };
  }

  if (!solveInPlace(state)) {
    return {
      sudoku: null,
      iterations: Infinity,
    };
  }

  return {
    sudoku: state.board,
    iterations: state.iterations,
  };
}

export function countSolutions(
  sudoku: SimpleSudoku,
  limit: number = 2,
): {count: number; firstSolution: SimpleSudoku | null; iterations: number} {
  const state = {
    board: cloneSudoku(sudoku),
    iterations: 0,
  };
  const solutions = {
    count: 0,
    firstSolution: null as SimpleSudoku | null,
  };

  if (!hasValidGivens(state.board)) {
    return {
      ...solutions,
      iterations: Infinity,
    };
  }

  countSolutionsInPlace(state, limit, solutions);

  return {
    ...solutions,
    iterations: state.iterations,
  };
}
