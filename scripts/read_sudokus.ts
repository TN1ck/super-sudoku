import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import {groupBy} from "lodash";
import {parseSudoku} from "../src/engine/utility";
import {solve} from "../src/engine/solverAC3";

const inFile = path.join(__dirname, "../sudokus.txt");
const outFile = path.join(__dirname, "../sudokus.json");

const lineReader = readline.createInterface({
  input: fs.createReadStream(inFile),
});

interface SudokuSolution {
  iterations: number;
  sudoku: number[][];
  solution: number[][];
  id: number;
}

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
  [0, 10, "easy"],
  [11, 20, "medium"],
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
    easy: groupedSudokus.easy,
    medium: groupedSudokus.medium,
    hard: groupedSudokus.hard,
    expert: groupedSudokus.expert,
    evil: groupedSudokus.evil,
  };
  fs.writeFileSync(outFile, JSON.stringify(outputJson));
});
