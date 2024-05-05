import {Command} from "commander";
import cheerio from "cheerio";
import {writeFileSync} from "fs";
import {printSimpleSudoku} from "../src/engine/utility";

const program = new Command();

async function fetchSudoku(level: number): Promise<number[][]> {
  const response = await fetch(`https://west.websudoku.com/?level=${level}`);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch Sudoku: ${response.statusText}`);
  }
  const body = await response.text();
  const $ = cheerio.load(body);
  const sudoku: number[][] = [];

  for (let row = 0; row < 9; row++) {
    const sudokuRow: number[] = [];
    for (let col = 0; col < 9; col++) {
      const input = $(`#f${row}${col}`);
      const value = input.val() as string;
      sudokuRow.push(value ? parseInt(value, 10) : 0);
    }
    sudoku.push(sudokuRow);
  }

  // If only empty throw error.
  if (sudoku.every((row) => row.every((cell) => cell === 0))) {
    console.log("Body: ", body);
    throw new Error("Failed to fetch Sudoku: Empty Sudoku");
  }

  return sudoku;
}

program
  .requiredOption("-n, --number <number>", "Number of times to fetch Sudoku")
  .requiredOption("-l, --level <level>", "Difficulty level of the Sudoku (1-4)")
  .action(async (options) => {
    const {number, level} = options;
    const sudokus: number[][][] = [];

    for (let i = 0; i < number; i++) {
      try {
        const sudoku = await fetchSudoku(level);
        sudokus.push(sudoku);
        console.log(`Fetched Sudoku #${i + 1} for level ${level}`);
      } catch (error) {
        console.error(`Failed to fetch Sudoku #${i + 1}: ${error}, breaking the loop and saving the fetched Sudokus`);
        break;
      }
      // Rate limiting, to avoid getting blocked
      console.log(`Waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const sudokusSerialized = sudokus.map((sudoku) => {
      return printSimpleSudoku(sudoku);
    });

    const jsonFileName = `sudokus-${level}-${number}-${new Date().getTime()}.json`;
    writeFileSync(jsonFileName, JSON.stringify(sudokusSerialized, null, 2));
    console.log(`Sudokus saved to ${jsonFileName}`);
  });

program.parse(process.argv);
