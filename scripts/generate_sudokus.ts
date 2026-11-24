import * as fs from "node:fs";
import * as path from "node:path";
import {program} from "commander";
import * as generate from "../src/lib/engine/generate_bitmask";
import * as solverAC3 from "../src/lib/engine/solverAC3_bitmask";
import {stringifySudoku} from "../src/lib/engine/utility";
import {DIFFICULTY, SimpleSudoku} from "../src/lib/engine/types";
import {createSeededRandom} from "../src/lib/engine/seededRandom";
import {extractPuzzleLines} from "./sudokuChunksPlugin";

program
  .version("0.0.1")
  .option("-n, --number <n>", "Number of sudokus to generate", (n) => parseInt(n, 10), 20)
  .option(
    "-d, --difficulty [type]",
    "Difficulty [easy], [medium], [hard], [expert], [evil]",
    /^(easy|medium|hard|expert|evil)$/i,
    "medium",
  )
  .option("-o, --output <path>", "Output file path (defaults to sudokus/<difficulty>.txt)")
  .parse(process.argv);

const mapping: Record<string, DIFFICULTY> = {
  easy: DIFFICULTY.EASY,
  medium: DIFFICULTY.MEDIUM,
  hard: DIFFICULTY.HARD,
  expert: DIFFICULTY.EXPERT,
  evil: DIFFICULTY.EVIL,
};

const options = program.opts<{number: number; difficulty: string; output?: string}>();
const difficulty = options.difficulty.toLowerCase();
const sudokuDifficulty = mapping[difficulty];
const outputPath = path.resolve(options.output ?? path.join("sudokus", `${difficulty}.txt`));

fs.mkdirSync(path.dirname(outputPath), {recursive: true});

const existingSudokus = new Set<string>();
let needsLeadingNewline = false;
if (fs.existsSync(outputPath)) {
  const existingRaw = fs.readFileSync(outputPath, "utf8");
  for (const line of extractPuzzleLines(existingRaw)) {
    existingSudokus.add(line);
  }
  needsLeadingNewline = existingRaw.length > 0 && !existingRaw.endsWith("\n");
}

function writeSudoku(sudoku: SimpleSudoku): boolean {
  const printedSudoku = stringifySudoku(sudoku);
  if (existingSudokus.has(printedSudoku)) {
    console.log("Duplicate sudoku generated. Skipping.");
    return false;
  }

  const iterations = solverAC3.solve(sudoku).iterations;
  console.log(`Write sudoku #${existingSudokus.size + 1} with ${iterations} iterations\n`, printedSudoku);
  const prefix = needsLeadingNewline ? "\n" : "";
  fs.appendFileSync(outputPath, `${prefix}${printedSudoku}\n`);
  needsLeadingNewline = false;
  existingSudokus.add(printedSudoku);
  return true;
}

const number = options.number;
console.log(
  `Generate ${number} "${difficulty}" sudoku puzzles into ${outputPath} (${existingSudokus.size} existing puzzles)`,
);

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
    if (writeSudoku(sudoku)) {
      i++;
      attempts = 0;
    } else {
      attempts++;
    }
  } else {
    console.log("Sudoku is not in difficulty range. Skipping.");
    attempts++;
  }
}

console.log(`Done! ${outputPath} now contains ${existingSudokus.size} unique puzzles.`);
