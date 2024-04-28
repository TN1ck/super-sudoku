import * as fs from "fs";
import {program} from "commander";
import * as generate from "../src/engine/generate";
import * as solverAC3 from "../src/engine/solverAC3";
import {printSimpleSudoku} from "../src/engine/utility";
import {DIFFICULTY} from "../src/engine/types";
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

const mapping = {
  easy: DIFFICULTY.EASY,
  medium: DIFFICULTY.MEDIUM,
  hard: DIFFICULTY.HARD,
  expert: DIFFICULTY.EXPERT,
  evil: DIFFICULTY.EVIL,
};

const options = program.opts();
const difficulty = options.difficulty;
const sudokuDifficulty = mapping[difficulty];

function writeSudoku(sudoku) {
  const iterations = solverAC3.solve(sudoku).iterations;
  const printedSudoku = printSimpleSudoku(sudoku);
  console.log(`write sudoku with difficulty ${iterations}\n`, printedSudoku);
  const stringToAppend = `${iterations}
${printedSudoku}


`;
  fs.appendFileSync("sudokus.txt", stringToAppend);
}

const number = options.number;
console.log(`Generate ${number} sudokus with difficulty ` + difficulty);

const randomFn = createSeededRandom(Math.random() * +new Date());
new Array(number).fill(0).forEach((_, i) => {
  console.log("Generate sudoku " + (i + 1));
  writeSudoku(generate.generateSudoku(sudokuDifficulty, randomFn));
});
