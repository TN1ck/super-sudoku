import {Command} from "commander";
import cheerio from "cheerio";
import {writeFileSync} from "fs";
import {stringifySudoku} from "../src/engine/utility";
import {map} from "lodash";

const program = new Command();

async function fetchSudokuFromWebSudoku(level: number): Promise<{sudoku: number[][]; winRate: number}> {
  if (level < 1 || level > 4) {
    throw new Error("Invalid level, must be between 1 and 4");
  }

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

  return {sudoku, winRate: -1};
}

export async function fetchSudokuFromSudokuDotCom(level: number): Promise<{sudoku: number[][]; winRate: number}> {
  if (level < 1 || level > 6) {
    throw new Error("Invalid level, must be between 1 and 6");
  }

  const LEVEL_MAPPING: Record<number, string> = {
    1: "easy",
    2: "medium",
    3: "hard",
    4: "expert",
    5: "evil",
    6: "extreme",
  };

  const mappedLevel = LEVEL_MAPPING[level];

  const response = await fetch(`https://sudoku.com/api/v2/level/${mappedLevel}`, {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      priority: "u=1, i",
      "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-easy-locale": "en",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: "https://sudoku.com/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  });
  if (response.status !== 200) {
    throw new Error(`Failed to fetch Sudoku: ${response.statusText}`);
  }

  const body = (await response.json()) as {
    // The sudoku is one string with 81 characters, 0-9, where 0 is empty.
    mission: string;
    solution: string;
    win_rate: number;
    id: number;
  };

  // Split the string into 9 strings with 9 characters each.
  const sudoku: number[][] = [];
  for (let i = 0; i < 9; i++) {
    sudoku.push(
      body.mission
        .slice(i * 9, (i + 1) * 9)
        .split("")
        .map((cell) => parseInt(cell, 10)),
    );
  }

  // If only empty throw error.
  if (sudoku.every((row) => row.every((cell) => cell === 0))) {
    console.log("Body: ", body);
    throw new Error("Failed to fetch Sudoku: Empty Sudoku");
  }

  return {sudoku, winRate: body.win_rate};
}

program
  .requiredOption("-n, --number <number>", "Number of times to fetch Sudoku")
  .requiredOption("-l, --level <level>", "Difficulty level of the Sudoku (1-6) (depends on the provider)")
  .requiredOption("-p, --provider <provider>", "The provider of the Sudokus")
  .action(async (options) => {
    const {number, level} = options;
    const sudokus: Array<{sudoku: number[][]; winRate: number}> = [];

    const provider = options.provider;

    switch (provider) {
      case "webSudoku":
        console.log("Fetching Sudokus from WebSudoku");
        break;
      case "sudokuDotCom":
        console.log("Fetching Sudokus from Sudoku.com");
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    const fetchFunction = provider === "webSudoku" ? fetchSudokuFromWebSudoku : fetchSudokuFromSudokuDotCom;

    for (let i = 0; i < number; i++) {
      try {
        const sudoku = await fetchFunction(level);
        sudokus.push(sudoku);
        console.log(`Fetched Sudoku #${i + 1} for level ${level}`);
      } catch (error) {
        console.error(`Failed to fetch Sudoku #${i + 1}: ${error}, breaking the loop and saving the fetched Sudokus`);
        break;
      }
      // Rate limiting, to avoid getting blocked
      console.log(`Waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const sudokusSerialized = sudokus.map((sudoku) => {
      return {sudoku: stringifySudoku(sudoku.sudoku), winRate: sudoku.winRate};
    });

    const jsonFileName = `sudokus-${level}-${number}-${new Date().getTime()}.json`;
    writeFileSync(jsonFileName, JSON.stringify(sudokusSerialized, null, 2));
    console.log(`Sudokus saved to ${jsonFileName}`);
  });

program.parse(process.argv);
