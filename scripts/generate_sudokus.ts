import * as fs from "fs";
import {program} from "commander";
import * as generate from "../src/engine/generate";
import * as solverAC3 from "../src/engine/solverAC3";
import {stringifySudoku} from "../src/engine/utility";
import {DIFFICULTY, SimpleSudoku} from "../src/engine/types";
import {createSeededRandom} from "../src/engine/seededRandom";

program
  .version("0.0.1")
  .option("-n, --number <n>", "Number of sudokus to generate", (n) => parseInt(n, 10), 20)
  .option(
    "-d, --difficulty [type]",
    "Difficulty [easy], [medium], [hard], [expert], [evil]",
    /^(easy|medium|hard|expert|evil)$/i,
    "medium",
  )
  .parse(process.argv);

const mapping: Record<string, DIFFICULTY> = {
  easy: DIFFICULTY.EASY,
  medium: DIFFICULTY.MEDIUM,
  hard: DIFFICULTY.HARD,
  expert: DIFFICULTY.EXPERT,
  evil: DIFFICULTY.EVIL,
};

const options = program.opts();
const difficulty = options.difficulty;
const sudokuDifficulty = mapping[difficulty];

function writeSudoku(sudoku: SimpleSudoku) {
  const iterations = solverAC3.solve(sudoku).iterations;
  const printedSudoku = stringifySudoku(sudoku);
  console.log(`Write sudoku with ${iterations} iterations\n`, printedSudoku);
  fs.appendFileSync("sudokus.txt", printedSudoku + "\n");
}

const number = options.number;
console.log(`Generate ${number} sudoku puzzles with difficulty "${difficulty}"`);

const randomFn = createSeededRandom(Math.random() * +new Date());
new Array(number).fill(0).forEach((_, i) => {
  console.log("Generate sudoku " + (i + 1));
  writeSudoku(generate.generateSudoku(sudokuDifficulty, randomFn));
});
