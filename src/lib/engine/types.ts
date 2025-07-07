export enum DIFFICULTY {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
  EVIL = "evil",
}

export interface CellCoordinates {
  x: number;
  y: number;
}
export type SimpleSudoku = number[][];
export interface Cell extends CellCoordinates {
  number: number;
  initial: boolean;
  notes: number[];
  solution: number;
}
