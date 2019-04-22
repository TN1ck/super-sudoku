import * as fs from "fs";
import * as program from "commander";
import * as generate from "../src/engine/generate";
import * as solverAC3 from "../src/engine/solverAC3";
import {printSimpleSudoku, DIFFICULTY} from "../src/engine/utility";

program
  .version("0.0.1")
  .option("-n, --number <n>", "Number of sudokus to generate", parseInt, 20)
  .option(
    "-d, --difficulty [type]",
    "Difficulty [easy], [medium], [hard], [evil]",
    /^(easy|medium|hard|evil)$/i,
    "medium",
  )
  .parse(process.argv);

const mapping = {
  easy: DIFFICULTY.EASY,
  medium: DIFFICULTY.MEDIUM,
  hard: DIFFICULTY.HARD,
  evil: DIFFICULTY.EVIL,
};

const difficulty = program.difficulty;
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

const number = program.number;
console.log(`Generate ${number} sudokus with difficulty ` + difficulty);
new Array(number).fill(0).forEach((_, i) => {
  console.log("Generate sudoku " + (i + 1));
  writeSudoku(generate.generateSudoku(sudokuDifficulty));
});
