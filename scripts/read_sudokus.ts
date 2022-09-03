import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import _, {groupBy} from "lodash";
import {parseSudoku} from "../src/engine/utility";
import {solve} from "../src/engine/solverAC3";

interface SudokuSolution {
  iterations: number;
  sudoku: number[][];
  solution: number[][];
  id: number;
}

function sortSudokus(solutions: SudokuSolution[]) {
  return _.sortBy(solutions, (d) => d.iterations);
}

const inFile = path.join(__dirname, "../sudokus.txt");
const outFile = path.join(__dirname, "../sudokus.json");

const lineReader = readline.createInterface({
  input: fs.createReadStream(inFile),
});

const sudokus: SudokuSolution[] = [];
let index = 0;
let currentIterations = 0;
let currentSudoku: string[] = [];

lineReader.on("line", (line) => {
  if (index === 0) {
    currentIterations = parseInt(line, 10);
  }
  if (index > 0 && index < 10) {
    currentSudoku.push(line);
  }
  if (index === 11) {
    const sudoku = parseSudoku(currentSudoku.join("\n"));
    sudokus.push({
      iterations: currentIterations,
      sudoku,
      solution: solve(sudoku).sudoku,
      id: sudokus.length,
    });
    currentIterations = 0;
    index = 0;
    currentSudoku = [];
  } else {
    index += 1;
  }
});

const difficultyMapping = [
  [0, 7, "easy"],
  [8, 20, "medium"],
  [21, 70, "hard"],
  [71, 299, "expert"],
  [300, 1000, "evil"],
];

lineReader.on("close", () => {
  const groupedSudokus = groupBy(sudokus, (s) => {
    const difficulty = difficultyMapping.find((d) => {
      return s.iterations >= d[0] && s.iterations < d[1];
    });
    return difficulty ? difficulty[2] : "not_grouped";
  });
  console.log(Object.keys(groupedSudokus).map((k) => [k, groupedSudokus[k].length]));
  // sort the groups
  const outputJson = {
    easy: sortSudokus(groupedSudokus.easy).slice(0, 100),
    medium: sortSudokus(groupedSudokus.medium).slice(0, 100),
    hard: sortSudokus(groupedSudokus.hard).slice(0, 100),
    expert: sortSudokus(groupedSudokus.expert).slice(0, 100),
    evil: sortSudokus(groupedSudokus.evil).slice(0, 100),
  };
  fs.writeFileSync(outFile, JSON.stringify(outputJson));
});
