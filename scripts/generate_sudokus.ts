import * as fs from "fs";
import {program} from "commander";
import * as generate from "../src/lib/engine/generate";
import * as solverAC3 from "../src/lib/engine/solverAC3";
import {stringifySudoku} from "../src/lib/engine/utility";
import {DIFFICULTY, SimpleSudoku} from "../src/lib/engine/types";
import {createSeededRandom} from "../src/lib/engine/seededRandom";

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
  fs.appendFileSync(`sudokus_${difficulty}.txt`, printedSudoku + "\n");
}

const number = options.number;
console.log(`Generate ${number} sudoku puzzles with difficulty "${difficulty}"`);

const randomFn = createSeededRandom(Math.random() * +new Date());
let i = 0;
let attempts = 0;
while (i < number) {
  console.log("Generate sudoku " + (i + 1) + " (attempt " + (attempts + 1) + ")");
  const {sudoku, isInDifficultyRange, iterations} = generate.generateSudoku(sudokuDifficulty, randomFn);
  console.log(
    `Needed ${iterations} iterations to generate this sudoku. Goal was ${generate.DIFFICULTY_GOALS[sudokuDifficulty]}.`,
  );
  if (isInDifficultyRange) {
    console.log("Sudoku is in difficulty range.");
    writeSudoku(sudoku);
    i++;
    attempts = 0;
  } else {
    console.log("Sudoku is not in difficulty range. Skipping.");
    attempts++;
  }
}
