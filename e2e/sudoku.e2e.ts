import {expect, Page, test} from "@playwright/test";

const FIRST_PUZZLE = "534920700060007309900000010008700000496803002721594806000200940800046100003000000";
const FIRST_SOLUTION = "534921768162487359987635214358762491496813572721594836615278943879346125243159687";
const ONE_EMPTY_CELL_PUZZLE = `${FIRST_SOLUTION.slice(0, -1)}0`;
const ISSUE_33_CUSTOM_PUZZLE = "008600700900020000000000800000050046300000010000009000046800000000000900070000000";
const ISSUE_33_CUSTOM_SOLUTION = "428615793931728654765943821892157346357486219614239578546892137183574962279361485";
const SHORTCUT_MODIFIER = "Control";
const CUSTOM_SUDOKU_VERIFICATION_LIMIT_MS = 5_000;

function gameUrl(sudoku = FIRST_PUZZLE, sudokuIndex = 1, sudokuCollectionName = "easy") {
  const params = new URLSearchParams({
    sudokuIndex: String(sudokuIndex),
    sudoku,
    sudokuCollectionName,
  });

  return `/#/?${params.toString()}`;
}

function cell(page: Page, x: number, y: number) {
  return page.getByTestId(`sudoku-cell-${x}-${y}`);
}

function cellValue(page: Page, x: number, y: number) {
  return page.getByTestId(`sudoku-cell-value-${x}-${y}`);
}

function cellNotes(page: Page, x: number, y: number) {
  return page.getByTestId(`sudoku-cell-notes-${x}-${y}`);
}

function cellCoordinates(index: number) {
  return {
    x: index % 9,
    y: Math.floor(index / 9),
  };
}

async function openGame(page: Page, sudoku = FIRST_PUZZLE, sudokuIndex = 1, collection = "easy", label = "Easy") {
  await page.goto(gameUrl(sudoku, sudokuIndex, collection));
  await expect(page.getByTestId("current-game-label")).toHaveText(`${label} #${sudokuIndex}`);
  await expect(page.getByTestId("sudoku-board")).toBeVisible();
  await continueIfPaused(page);
  await expect(cellValue(page, 5, 0)).toHaveText(sudoku[5] === "0" ? "" : sudoku[5]);
}

async function continueIfPaused(page: Page) {
  const continueButton = page.getByRole("button", {name: "Continue"});
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
  await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
}

async function openSettings(page: Page) {
  const toggle = page.getByRole("button", {name: "Settings"});
  if ((await toggle.getAttribute("aria-expanded")) !== "true") {
    await toggle.click();
  }
}

async function selectCell(page: Page, x: number, y: number) {
  await cell(page, x, y).click();
  await expect(cell(page, x, y)).toHaveAttribute("data-cell-active", "true");
}

async function enterSudokuValues(
  page: Page,
  values: string,
  shouldEnter: (value: string, index: number) => boolean = (value) => value !== "0",
) {
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (!shouldEnter(value, index)) {
      continue;
    }

    const {x, y} = cellCoordinates(index);
    await selectCell(page, x, y);
    await page.keyboard.press(value);
  }
}

async function storeCollection(page: Page, id: string, name: string, puzzles: string[]) {
  await page.evaluate(
    ({id, name, puzzles}) => {
      localStorage.setItem(`super_sudoku_collections_names_${id}`, name);
      localStorage.setItem(`super_sudoku_collections_sudokus_${id}`, puzzles.join("\n"));
    },
    {id, name, puzzles},
  );
}

async function expectStoredPreferences(page: Page, preferences: Record<string, boolean>) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const rawPreferences = localStorage.getItem("super-sudoku-user-preferences");
        return rawPreferences ? JSON.parse(rawPreferences) : null;
      }),
    )
    .toMatchObject(preferences);
}

test.beforeEach(async ({context, baseURL}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {origin: new URL(baseURL!).origin});
});

test("uses the application name as the browser tab title", async ({page}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Super Sudoku");
});

test("rejects an invalid puzzle link once and restores the current puzzle URL", async ({page}) => {
  const dialogs: Array<{type: string; message: string}> = [];
  page.on("dialog", async (dialog) => {
    dialogs.push({type: dialog.type(), message: dialog.message()});
    await dialog.dismiss();
  });
  await page.goto(gameUrl("invalid"));
  await expect(page).toHaveURL(new RegExp(FIRST_PUZZLE));
  await continueIfPaused(page);
  await expect(cellValue(page, 0, 0)).toHaveText("5");
  expect(dialogs).toEqual([{type: "alert", message: "This link contains an invalid sudoku."}]);
});

test("fills in the collection and index on an incomplete link to the current grid", async ({page}) => {
  await page.goto(`/#/?sudoku=${FIRST_PUZZLE}`);
  await expect(page.getByTestId("current-game-label")).toHaveText("Easy #1");
  await expect(page).toHaveURL(/sudokuIndex=1(?:&|$)/);
  await expect(page).toHaveURL(/sudokuCollectionName=easy(?:&|$)/);
});

test("declining a puzzle switch restores the URL and keeps the last move", async ({page}) => {
  await page.clock.install();
  await openGame(page);
  await selectCell(page, 5, 0);
  await page.keyboard.press("1");
  await page.clock.fastForward(7000);
  const dialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.type());
    await dialog.dismiss();
  });
  await page.getByRole("button", {name: "New game"}).click();
  await page.getByTestId("sudoku-preview-2").click();
  await expect(page).toHaveURL(new RegExp(FIRST_PUZZLE));
  await continueIfPaused(page);
  await expect(cellValue(page, 5, 0)).toHaveText("1");
  expect(dialogs).toEqual(["confirm"]);
});

test("keeps the latest move when reloaded before the autosave interval", async ({page}) => {
  await page.clock.setFixedTime(new Date("2026-01-01T12:00:00Z"));
  await openGame(page);
  await selectCell(page, 5, 0);
  await page.keyboard.press("1");
  await expect(cellValue(page, 5, 0)).toHaveText("1");

  await page.reload();
  await continueIfPaused(page);
  await expect(cellValue(page, 5, 0)).toHaveText("1");
});

test("locks the editing controls when paused and after a win", async ({page}) => {
  await openGame(page, ONE_EMPTY_CELL_PUZZLE);
  await selectCell(page, 8, 8);
  await page.keyboard.press("1");
  await page.getByRole("button", {name: "Pause"}).click();
  const number = page.getByRole("button", {name: "Set 7"});
  const controls = [
    number,
    page.getByRole("button", {name: "Undo"}),
    page.getByRole("button", {name: "Hint"}),
    page.getByRole("button", {name: "Erase"}),
    page.getByRole("button", {name: /Notes/}),
  ];
  for (const control of controls) {
    await expect(control).toBeDisabled();
  }
  await page.getByRole("button", {name: "Continue"}).click();
  await expect(cellValue(page, 8, 8)).toHaveText("1");
  await number.click();
  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
  for (const control of controls) {
    await expect(control).toBeDisabled();
  }
});

test("hint and erase require a selected cell", async ({page}) => {
  await openGame(page, "0" + FIRST_SOLUTION.slice(1));
  await expect(page.getByRole("button", {name: "Hint"})).toBeDisabled();
  await expect(page.getByRole("button", {name: "Erase"})).toBeDisabled();
  await selectCell(page, 0, 0);
  await expect(page.getByRole("button", {name: "Erase"})).toBeEnabled();
  await page.getByRole("button", {name: "Hint"}).click();
  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
});

test("a hint removes conflicting pencil notes and undo restores them", async ({page}) => {
  await openGame(page);
  await openSettings(page);
  await page.locator("#circle_menu").uncheck();
  await selectCell(page, 7, 0);
  await page.keyboard.press("n");
  await page.keyboard.press("1");
  await page.keyboard.press("6");
  await expect(cellNotes(page, 7, 0)).toHaveText("16");
  await selectCell(page, 5, 0);
  await page.keyboard.press("h");
  await expect(cellValue(page, 5, 0)).toHaveText("1");
  await expect(cellNotes(page, 7, 0)).toHaveText("6");
  await page.getByRole("button", {name: "Undo"}).click();
  await expect(cellValue(page, 5, 0)).toBeEmpty();
  await expect(cellNotes(page, 7, 0)).toHaveText("16");
});

test("edits generated and manual notes through all three input methods", async ({page}) => {
  await openGame(page);
  await openSettings(page);
  await page.locator("#generated_notes").check();
  await selectCell(page, 5, 0);
  const notes = cellNotes(page, 5, 0);
  await expect(notes).toHaveText("18");
  await page.keyboard.press("n");
  await page.keyboard.press("8");
  await expect(notes).toHaveText("1");
  await page.getByRole("button", {name: "Set 3"}).click();
  await expect(notes).toHaveText("13");
  await selectCell(page, 5, 0);
  const slice = page.getByTestId("sudoku-menu-circle").locator("g").filter({hasText: /^1$/});
  await slice.locator("circle").dispatchEvent("click");
  await expect(notes).toHaveText("3");
});

test("a keypad press on a given leaves the board and its notes unchanged", async ({page}) => {
  await openGame(page);
  await openSettings(page);
  await page.locator("#circle_menu").uncheck();
  await selectCell(page, 5, 0);
  await page.keyboard.press("n");
  await page.keyboard.press("5");
  await page.keyboard.press("n");
  await selectCell(page, 0, 0);
  await page.getByRole("button", {name: "Set 9"}).click();
  await expect(cellValue(page, 0, 0)).toHaveText("5");
  await expect(cellNotes(page, 5, 0)).toHaveText("5");
});

for (const isCurrent of [true, false]) {
  test(`resumes the ${isCurrent ? "current" : "previous"} puzzle in the selected collection`, async ({page}) => {
    await openGame(page);
    await selectCell(page, 5, 0);
    await page.keyboard.press("1");
    await storeCollection(page, "favorites", "Favorites", [ONE_EMPTY_CELL_PUZZLE, FIRST_PUZZLE]);
    const newGame = page.getByRole("button", {name: "New game"});
    await newGame.click();
    if (!isCurrent) {
      await page.getByTestId("sudoku-preview-2").click();
      await expect(page.getByTestId("current-game-label")).toHaveText("Easy #2");
      await newGame.click();
    }
    await page.getByRole("button", {name: "Favorites"}).click();
    await page.getByTestId("sudoku-preview-2").click();
    await expect(page.getByTestId("current-game-label")).toHaveText("Favorites #2");
    await continueIfPaused(page);
    await expect(cellValue(page, 5, 0)).toHaveText("1");
    await page.reload();
    await expect(page.getByTestId("current-game-label")).toHaveText("Favorites #2");
  });
}

test("starts a new attempt when consecutive collection entries share a grid", async ({page}) => {
  await page.goto("/#/select-game");
  await storeCollection(page, "pair", "Pair", [ONE_EMPTY_CELL_PUZZLE, ONE_EMPTY_CELL_PUZZLE]);
  await openGame(page, ONE_EMPTY_CELL_PUZZLE, 1, "pair", "Pair");
  await selectCell(page, 8, 8);
  await page.keyboard.press("7");
  await page.getByRole("button", {name: "Select next sudoku: Pair #2"}).click();
  await expect(page.getByTestId("current-game-label")).toHaveText("Pair #2");
  await expect(page.getByRole("button", {name: "Pause"})).toBeEnabled();
  await expect(cellValue(page, 8, 8)).toBeEmpty();
});

test("undo after a new edit keeps previously undone moves off the board", async ({page}) => {
  await openGame(page);
  const undo = page.getByRole("button", {name: "Undo"});
  await selectCell(page, 5, 0);
  await page.keyboard.press("1");
  await undo.click();
  await selectCell(page, 7, 0);
  await page.keyboard.press("6");
  await undo.click();

  await expect(cellValue(page, 5, 0)).toBeEmpty();
  await expect(cellValue(page, 7, 0)).toBeEmpty();
  await expect(undo).toBeDisabled();
  await page.keyboard.press(`${SHORTCUT_MODIFIER}+Y`);
  await expect(cellValue(page, 7, 0)).toHaveText("6");
  await expect(cellValue(page, 5, 0)).toBeEmpty();
});

test("erasing an already empty cell preserves redo", async ({page}) => {
  await openGame(page);
  await selectCell(page, 5, 0);
  await page.keyboard.press("1");
  const undo = page.getByRole("button", {name: "Undo"});
  await undo.click();
  await page.getByRole("button", {name: "Erase"}).click();
  await expect(undo).toBeDisabled();
  await page.keyboard.press(`${SHORTCUT_MODIFIER}+Y`);
  await expect(cellValue(page, 5, 0)).toHaveText("1");
});

test("supports number entry, erase, undo, redo, notes, hints, and keyboard shortcuts", async ({page}) => {
  await openGame(page);

  await selectCell(page, 5, 0);
  await page.getByRole("button", {name: "Set 1"}).click();
  await expect(cellValue(page, 5, 0)).toHaveText("1");

  await page.getByRole("button", {name: "Erase"}).click();
  await expect(cellValue(page, 5, 0)).toHaveText("");

  await page.getByRole("button", {name: "Set 2"}).click();
  await expect(cellValue(page, 5, 0)).toHaveText("2");

  await page.getByRole("button", {name: "Undo"}).click();
  await expect(cellValue(page, 5, 0)).toHaveText("");

  await page.keyboard.press(`${SHORTCUT_MODIFIER}+Y`);
  await expect(cellValue(page, 5, 0)).toHaveText("2");

  await page.keyboard.press("Backspace");
  await expect(cellValue(page, 5, 0)).toHaveText("");

  await page.keyboard.press("ArrowRight");
  await expect(cell(page, 6, 0)).toHaveAttribute("data-cell-active", "true");
  await page.keyboard.press("ArrowRight");
  await expect(cell(page, 7, 0)).toHaveAttribute("data-cell-active", "true");
  await page.keyboard.press("6");
  await expect(cellValue(page, 7, 0)).toHaveText("6");

  await selectCell(page, 8, 0);
  await page.keyboard.press("h");
  await expect(cellValue(page, 8, 0)).toHaveText("8");

  await selectCell(page, 5, 0);
  await page.keyboard.press("n");
  await expect(cell(page, 5, 0)).toHaveAttribute("data-cell-notes-mode", "true");
  await page.keyboard.press("3");
  await page.keyboard.press("4");
  await expect(cellNotes(page, 5, 0)).toContainText("3");
  await expect(cellNotes(page, 5, 0)).toContainText("4");

  await page.keyboard.press(`${SHORTCUT_MODIFIER}+C`);
  await selectCell(page, 0, 1);
  await page.keyboard.press(`${SHORTCUT_MODIFIER}+V`);
  await expect(cellNotes(page, 0, 1)).toContainText("3");
  await expect(cellNotes(page, 0, 1)).toContainText("4");

  await page.keyboard.press("n");
  await page.keyboard.press("5");
  await expect(cellValue(page, 0, 1)).toHaveText("5");
  await expect(cellNotes(page, 0, 1)).toHaveText("");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", {name: "Continue"})).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
});

test("persists game settings, dark mode, and language selection", async ({page}) => {
  await openGame(page);
  await openSettings(page);

  await page.locator("#generated_notes").check();
  await expect(cellNotes(page, 5, 0)).toContainText("1");

  await page.locator("#show_occurrences").check();
  await expect(page.getByTestId("sudoku-number-occurrences-5")).toBeVisible();

  await page.locator("#highlight_conflicts").uncheck();
  await page.locator("#highlight_wrong_entries").check();
  await selectCell(page, 5, 0);
  await page.getByRole("button", {name: "Set 2"}).click();
  await expect(cell(page, 5, 0)).toHaveAttribute("data-cell-conflict", "true");

  await page.locator("#circle_menu").uncheck();
  await selectCell(page, 7, 0);
  await expect(page.getByTestId("sudoku-menu-circle")).toHaveCount(0);

  await expectStoredPreferences(page, {
    showHints: true,
    showWrongEntries: true,
    showConflicts: false,
    showCircleMenu: false,
    showOccurrences: true,
  });

  await page.reload();
  await openSettings(page);
  await expect(page.locator("#generated_notes")).toBeChecked();
  await expect(page.locator("#highlight_wrong_entries")).toBeChecked();
  await expect(page.locator("#highlight_conflicts")).not.toBeChecked();
  await expect(page.locator("#circle_menu")).not.toBeChecked();
  await expect(page.locator("#show_occurrences")).toBeChecked();

  await page.getByRole("button", {name: "Toggle dark mode"}).click();
  await expect(page.locator("body")).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("darkMode"))).toBe("true");

  await page.getByLabel("Select language").selectOption("es");
  await expect(page.getByRole("button", {name: "Nuevo juego"})).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("language"))).toBe("es");

  await page.reload();
  await expect(page.getByRole("button", {name: "Nuevo juego"})).toBeVisible();
});

test("solves a sudoku and starts the next game from the win screen", async ({page}) => {
  await openGame(page, ONE_EMPTY_CELL_PUZZLE);

  await selectCell(page, 8, 8);
  await page.getByRole("button", {name: "Set 7"}).click();

  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
  await page.getByRole("button", {name: "Select next sudoku: Easy #2"}).click();

  await expect(page.getByTestId("current-game-label")).toHaveText("Easy #2");
  await expect(page.getByText(/Congrats, you won/)).toHaveCount(0);
  await expect(page).toHaveURL(/sudokuCollectionName=easy/);
});

test("saves a second win immediately after advancing to the next puzzle", async ({page}) => {
  await page.goto("/#/select-game");
  const first = "0" + FIRST_SOLUTION.slice(1);
  await storeCollection(page, "pair", "Pair", [first, ONE_EMPTY_CELL_PUZZLE]);
  await openGame(page, first, 1, "pair", "Pair");
  await selectCell(page, 0, 0);
  await page.keyboard.press("5");
  const next = page.getByRole("button", {name: "Select next sudoku: Pair #2"});
  await expect(next).toBeVisible();

  await next.click();
  await expect(page.getByTestId("current-game-label")).toHaveText("Pair #2");
  await selectCell(page, 8, 8);
  await page.keyboard.press("7");
  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("current-game-label")).toHaveText("Pair #2");
  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
});

test("changes games through the selection screen", async ({page}) => {
  await openGame(page);

  await page.getByRole("button", {name: "New game"}).click();
  await expect(page.getByRole("heading", {name: "Select Game"})).toBeVisible();

  await page.getByRole("button", {name: "Medium"}).click();
  await page.getByTestId("sudoku-preview-1").click();

  await expect(page.getByTestId("current-game-label")).toHaveText("Medium #1");
  await expect(page).toHaveURL(/sudokuCollectionName=medium/);
});

test("restarts the last completed puzzle from the collection and keeps its solve history", async ({page}) => {
  await page.goto("/#/select-game");
  await page.evaluate(
    ({puzzle, solution}) => {
      const game = {
        sudokuCollectionName: "easy",
        sudokuIndex: 0,
        won: true,
        secondsPlayed: 91,
        timesSolved: 2,
        previousTimes: [100, 91],
        state: "PAUSED",
      };
      localStorage.setItem("super_sudoku_1_6_" + puzzle, JSON.stringify({game, completedGrid: solution}));
      localStorage.setItem("super_sudoku_currently_playing_sudoku", puzzle);
    },
    {puzzle: FIRST_PUZZLE, solution: FIRST_SOLUTION},
  );
  await page.reload();
  await expect(page.getByText("Solved 2 times")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTestId("sudoku-preview-1").click();
  await expect(page.getByRole("button", {name: "Pause"})).toBeEnabled();
  await expect(cellValue(page, 5, 0)).toBeEmpty();
  const replay = await page.evaluate(
    (puzzle) => JSON.parse(localStorage.getItem("super_sudoku_1_6_" + puzzle)!),
    FIRST_PUZZLE,
  );
  expect(replay.game).toMatchObject({won: false, timesSolved: 2, previousTimes: [100, 91]});
});

test("saves another game after old completed games fill localStorage", async ({page}) => {
  await page.goto("/#/select-game");
  await page.evaluate(
    ({solution}) => {
      // Vary the clues to create distinct old-format records with the same valid solution.
      for (let i = 1; i < 65536; i++) {
        const sudoku = Array.from(solution, (digit, index) => ({
          x: index % 9,
          y: Math.floor(index / 9),
          initial: index >= 16 || (i & (1 << index)) !== 0,
          notes: [],
          number: Number(digit),
          solution: Number(digit),
        }));
        const key = sudoku.map((cell) => (cell.initial ? cell.number : 0)).join("");
        const game = {
          won: true,
          state: "PAUSED",
          secondsPlayed: 42,
          timesSolved: 1,
          previousTimes: [42],
          sudokuCollectionName: "easy",
          sudokuIndex: i - 1,
        };
        try {
          localStorage.setItem("super_sudoku_1_6_" + key, JSON.stringify({game, sudoku}));
        } catch (error) {
          if (error instanceof DOMException && error.name === "QuotaExceededError") {
            // Fill the remaining bytes so even a single compact record cannot be staged.
            let padding = "";
            for (let chunk = 4096; chunk >= 1; chunk /= 2) {
              const value = padding + "x".repeat(chunk);
              try {
                localStorage.setItem("quota-padding", value);
                padding = value;
              } catch (failure) {
                if (!(failure instanceof DOMException && failure.name === "QuotaExceededError")) {
                  throw failure;
                }
              }
            }
            return;
          }
          throw error;
        }
      }
      throw new Error("Expected the browser storage quota to be reached");
    },
    {solution: FIRST_SOLUTION},
  );

  await openGame(page, ONE_EMPTY_CELL_PUZZLE);
  await selectCell(page, 8, 8);
  await page.keyboard.press("7");
  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("super_sudoku_currently_playing_sudoku")))
    .toBe(ONE_EMPTY_CELL_PUZZLE);
  await page.evaluate(() => window.history.replaceState(null, "", "/"));
  await page.reload();
  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
  await expect(page.getByRole("button", {name: "Select next sudoku: Easy #2"})).toBeVisible();
  const firstOldKey = "super_sudoku_1_7_" + FIRST_SOLUTION[0] + "0".repeat(15) + FIRST_SOLUTION.slice(16);
  const oldWin = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), firstOldKey);
  expect(oldWin).toMatchObject({game: {timesSolved: 1, previousTimes: [42]}, completedGrid: FIRST_SOLUTION});
});

test("shows the newly saved custom puzzle on the next collection page", async ({page}) => {
  await page.goto("/#/select-game");
  await storeCollection(page, "custom", "Custom", Array(12).fill(FIRST_PUZZLE));
  await page.reload();
  await page.getByRole("button", {name: "Custom", exact: true}).click();
  await expect(page.getByTestId("sudoku-preview-12")).toBeVisible();

  await page.getByRole("button", {name: "Add sudoku +"}).click();
  await enterSudokuValues(page, ISSUE_33_CUSTOM_PUZZLE);
  await page.getByRole("button", {name: "Save sudoku"}).click();

  const savedPuzzle = page.getByTestId("sudoku-preview-13");
  await expect(savedPuzzle).toBeVisible();
  await savedPuzzle.click();
  await expect(page.getByTestId("current-game-label")).toHaveText("Custom #13");
  await expect(page).toHaveURL(new RegExp(ISSUE_33_CUSTOM_PUZZLE));
});

test("shows the newly saved puzzle when another tab fills the first page during editing", async ({page, context}) => {
  await page.goto("/#/select-game");
  await storeCollection(page, "custom", "Custom", Array(11).fill(FIRST_PUZZLE));
  await page.reload();
  await page.getByRole("button", {name: "Custom", exact: true}).click();
  await page.getByRole("button", {name: "Add sudoku +"}).click();
  await enterSudokuValues(page, ISSUE_33_CUSTOM_PUZZLE);

  const otherTab = await context.newPage();
  await otherTab.goto("/#/select-game");
  await storeCollection(otherTab, "custom", "Custom", [...Array(11).fill(FIRST_PUZZLE), ONE_EMPTY_CELL_PUZZLE]);
  await page.getByRole("button", {name: "Save sudoku"}).click();
  await expect(page.getByTestId("sudoku-preview-13")).toBeVisible();
});

test("creates and solves a difficult custom sudoku", async ({page}) => {
  test.setTimeout(60_000);
  const customCollectionName = "Issue #33 custom";

  await page.goto("/#/select-game");
  await expect(page.getByRole("heading", {name: "Select Game"})).toBeVisible();

  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("prompt");
    await dialog.accept(customCollectionName);
  });
  await page.getByRole("button", {name: "+ New Collection"}).click();
  await expect(page.getByRole("button", {name: customCollectionName})).toBeVisible();

  await page.getByRole("button", {name: "Add sudoku +"}).click();
  await expect(page.getByText("Create new sudoku")).toBeVisible();

  await selectCell(page, 0, 0);
  await page.keyboard.press("1");
  const undo = page.getByRole("button", {name: "Undo"});
  await undo.click();
  await expect(cellValue(page, 0, 0)).toBeEmpty();
  await expect(undo).toBeDisabled();

  await enterSudokuValues(page, ISSUE_33_CUSTOM_PUZZLE);

  const saveStartedAt = performance.now();
  await page.getByRole("button", {name: "Save sudoku"}).click();
  await expect(page.getByTestId("sudoku-preview-1")).toBeVisible();
  const saveDurationMs = performance.now() - saveStartedAt;
  expect(saveDurationMs).toBeLessThan(CUSTOM_SUDOKU_VERIFICATION_LIMIT_MS);

  await page.getByTestId("sudoku-preview-1").click();
  await expect(page.getByTestId("current-game-label")).toHaveText(`${customCollectionName} #1`);
  await continueIfPaused(page);
  await openSettings(page);
  await page.locator("#circle_menu").uncheck();
  await expect(page.locator("#circle_menu")).not.toBeChecked();

  await enterSudokuValues(page, ISSUE_33_CUSTOM_SOLUTION, (_, index) => ISSUE_33_CUSTOM_PUZZLE[index] === "0");

  await expect(page.getByText(/Congrats, you won/)).toBeVisible();
  await expect(
    page.getByText(
      `Congratulations! You arrived at the end of collection "${customCollectionName}". Select a new sudoku to play.`,
    ),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.getByTestId("sudoku-board").evaluate((board) => {
        const text = board.textContent ?? "";
        return text.match(/arrived at the end of collection/g)?.length ?? 0;
      }),
    )
    .toBe(1);
});

test("copies a shareable sudoku URL that opens the same puzzle", async ({context, page}) => {
  await openGame(page);

  await page.getByTestId("share-sudoku").click();
  await expect(page.getByTestId("share-sudoku")).toContainText("Copied");

  const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
  expect(shareUrl).toContain("#/?");
  expect(shareUrl).toContain(`sudoku=${FIRST_PUZZLE}`);
  expect(shareUrl).toContain("sudokuCollectionName=easy");

  const sharedPage = await context.newPage();
  await sharedPage.goto(shareUrl);
  await expect(sharedPage.getByTestId("current-game-label")).toHaveText("Easy #1");
  await continueIfPaused(sharedPage);
  await expect(cellValue(sharedPage, 0, 0)).toHaveText("5");
  await expect(cellValue(sharedPage, 5, 0)).toHaveText("");
});

test.describe("gameplay regressions", () => {
  test("an older tab cannot erase a saved win", async ({page, context}) => {
    await openGame(page, ONE_EMPTY_CELL_PUZZLE);
    const other = await context.newPage();
    await openGame(other, ONE_EMPTY_CELL_PUZZLE);
    await other.getByRole("button", {name: "Pause", exact: true}).click();
    await selectCell(page, 8, 8);
    await page.keyboard.press("7");
    await expect(page.getByText(/Congrats, you won/)).toBeVisible();
    await other.keyboard.press("Escape");
    await other.reload(); // Flush the older tab's pending autosave.
    await page.reload();
    await expect(page.getByText(/Congrats, you won/)).toBeVisible();
    await expect(page.getByText("You solved this sudoku 1 time")).toBeVisible();
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem("super_sudoku_1_7_" + key)!),
      ONE_EMPTY_CELL_PUZZLE,
    );
    expect(saved.completedGrid).toBe(FIRST_SOLUTION);
    expect(saved.game.previousTimes).toHaveLength(1);
  });

  test("browser Back restores the completed board", async ({page}) => {
    await openGame(page, ONE_EMPTY_CELL_PUZZLE);
    await selectCell(page, 8, 8);
    await page.keyboard.press("7");
    await page.getByRole("button", {name: /Select next sudoku/}).click();
    await expect(page.getByTestId("current-game-label")).toHaveText("Easy #2");
    await page.goBack();
    await expect(page.getByTestId("current-game-label")).toHaveText("Easy #1");
    await expect(page.getByText(/Congrats, you won/)).toBeVisible();
    await page.reload();
    await expect(page.getByText("You solved this sudoku 1 time")).toBeVisible();
  });

  test("the fallback game saves moves across reload", async ({page}) => {
    await page.goto("/#/play");
    await continueIfPaused(page);
    await selectCell(page, 5, 0);
    await page.keyboard.press("1");
    await expect(cellValue(page, 5, 0)).toHaveText("1");
    await page.reload();
    await continueIfPaused(page);
    await expect(cellValue(page, 5, 0)).toHaveText("1");
  });

  test("visiting the picker preserves undo and redo", async ({page}) => {
    await openGame(page);
    await selectCell(page, 5, 0);
    await page.keyboard.press("1");
    await page.keyboard.press("2");
    await page.keyboard.press("Control+z");
    await expect(cellValue(page, 5, 0)).toHaveText("1");
    await page.getByRole("button", {name: "New game"}).click();
    await page.getByRole("button", {name: /Go back/}).click();
    await continueIfPaused(page);
    await expect(page.getByRole("button", {name: "Undo"})).toBeEnabled();
    await page.keyboard.press("Control+y");
    await expect(cellValue(page, 5, 0)).toHaveText("2");
    await page.keyboard.press("Control+z");
    await page.keyboard.press("Control+z");
    await expect(cellValue(page, 5, 0)).toBeEmpty();
  });

  test("removing the last visible candidate keeps it empty", async ({page}) => {
    await openGame(page);
    await openSettings(page);
    await page.locator("#generated_notes").check();
    await selectCell(page, 5, 0);
    await page.keyboard.press("n");
    await page.keyboard.press("8");
    await expect(cellNotes(page, 5, 0)).toHaveText("1");
    await page.keyboard.press("1");
    await expect(cellNotes(page, 5, 0)).toBeEmpty();
    await page.keyboard.press("Control+z");
    await expect(cellNotes(page, 5, 0)).toHaveText("1");
    await page.keyboard.press("Control+y");
    await page.reload();
    await continueIfPaused(page);
    await expect(cellNotes(page, 5, 0)).toBeEmpty();
    await page.getByRole("button", {name: "Erase"}).click();
    await expect(cellNotes(page, 5, 0)).toHaveText("18");
  });

  test("copying generated notes replaces the previous clipboard", async ({page}) => {
    await openGame(page);
    await openSettings(page);
    await page.locator("#circle_menu").uncheck();
    await selectCell(page, 7, 0);
    await page.keyboard.press("n");
    await page.keyboard.press("3");
    await page.keyboard.press("Control+c");
    await page.locator("#generated_notes").check();
    await selectCell(page, 5, 0);
    await expect(cellNotes(page, 5, 0)).toHaveText("18");
    await page.keyboard.press("Control+c");
    await selectCell(page, 8, 0);
    await page.keyboard.press("Control+v");
    await expect(cellNotes(page, 8, 0)).toHaveText("18");
  });

  test("right-click enters a note without changing number mode", async ({page}) => {
    await openGame(page);
    await cell(page, 5, 0).click({button: "right"});
    const slice = page.getByTestId("sudoku-menu-circle").locator("g").filter({hasText: /^8$/});
    await slice.locator("circle").dispatchEvent("click");
    await expect(cellNotes(page, 5, 0)).toHaveText("8");
    await expect(cellValue(page, 5, 0)).toBeEmpty();
    await page.keyboard.press("1");
    await expect(cellValue(page, 5, 0)).toHaveText("1");
  });

  test("short play intervals count towards elapsed time", async ({page}) => {
    await page.clock.install({time: new Date("2026-01-01T00:00:00Z")});
    await page.goto(gameUrl());
    await expect(page.getByTestId("sudoku-board")).toBeVisible();
    await page.clock.pauseAt(new Date("2026-01-01T00:01:00Z"));
    try {
      await continueIfPaused(page);
      for (let i = 0; i < 10; i++) {
        await page.clock.runFor(800);
        await page.keyboard.press("Escape");
        await expect(page.getByRole("button", {name: "Continue", exact: true})).toBeVisible();
        if (i < 9) {
          await page.keyboard.press("Escape");
        }
      }
      await expect(page.getByText("00:08 min", {exact: true})).toBeVisible();
      await page.reload();
      await expect(page.getByText("00:08 min", {exact: true})).toBeVisible();
    } finally {
      await page.clock.resume();
    }
  });

  test("a delayed resume does not start a hidden game", async ({page}) => {
    await page.clock.install();
    await openGame(page);
    const setVisibility = (visibility: "hidden" | "visible") =>
      page.evaluate((value) => {
        Object.defineProperty(document, "visibilityState", {configurable: true, get: () => value});
        document.dispatchEvent(new Event("visibilitychange"));
      }, visibility);
    await setVisibility("hidden");
    const resume = page.getByRole("button", {name: "Continue", exact: true});
    await expect(resume).toBeVisible();
    await setVisibility("visible");
    await page.clock.runFor(50);
    await setVisibility("hidden");
    await page.clock.runFor(2000);
    await expect(resume).toBeVisible();
    await setVisibility("visible");
    await page.clock.runFor(300);
    await expect(page.getByRole("button", {name: "Pause", exact: true})).toBeVisible();
  });

  test("manually paused game stays paused after switching tabs and returning", async ({page}) => {
    await page.clock.install();
    await openGame(page);
    await page.getByRole("button", {name: "Pause", exact: true}).click();
    const resume = page.getByRole("button", {name: "Continue", exact: true});
    await expect(resume).toBeVisible();

    const setVisibility = (visibility: "hidden" | "visible") =>
      page.evaluate((value) => {
        Object.defineProperty(document, "visibilityState", {configurable: true, get: () => value});
        document.dispatchEvent(new Event("visibilitychange"));
      }, visibility);
    await setVisibility("hidden");
    await page.clock.runFor(500);
    await setVisibility("visible");
    await page.clock.runFor(500);
    await expect(resume).toBeVisible();
  });

  test("clicking a given cell closes the circle menu instead of moving it onto the given", async ({page}) => {
    await openGame(page);
    await selectCell(page, 5, 0);
    await expect(page.getByTestId("sudoku-menu-circle")).toBeVisible();
    await selectCell(page, 0, 0);
    await expect(page.getByTestId("sudoku-menu-circle")).toHaveCount(0);
  });

  test("switching language updates the collection label immediately without reload", async ({page}) => {
    await openGame(page);
    await expect(page.getByTestId("current-game-label")).toHaveText("Easy #1");
    await page.getByLabel("Select language").selectOption("es");
    await expect(page.getByTestId("current-game-label")).toHaveText("Fácil #1");
    await page.getByLabel("Select language").selectOption("fr");
    await expect(page.getByTestId("current-game-label")).toHaveText("Facile #1");
  });

  test("entering a note on a filled cell with auto-notes enabled sets only the entered note", async ({page}) => {
    await openGame(page);
    await openSettings(page);
    await page.getByText("Show auto generated notes").click();
    await expect(page.locator("#generated_notes")).toBeChecked();

    await selectCell(page, 5, 0);
    await page.keyboard.press("2");
    await expect(cellValue(page, 5, 0)).toHaveText("2");

    await page.keyboard.press("n");
    await page.keyboard.press("8");
    await expect(cellValue(page, 5, 0)).toBeEmpty();
    await expect(cellNotes(page, 5, 0)).toHaveText("8");
  });

  test("supports Delete key to clear and Ctrl+Shift+Z to redo", async ({page}) => {
    await openGame(page);
    await selectCell(page, 5, 0);
    await page.keyboard.press("1");
    await expect(cellValue(page, 5, 0)).toHaveText("1");
    await page.keyboard.press("Delete");
    await expect(cellValue(page, 5, 0)).toBeEmpty();
    await page.keyboard.press(`${SHORTCUT_MODIFIER}+Z`);
    await expect(cellValue(page, 5, 0)).toHaveText("1");
    await page.keyboard.press(`${SHORTCUT_MODIFIER}+Shift+Z`);
    await expect(cellValue(page, 5, 0)).toBeEmpty();
  });

  test("recovers gracefully from corrupted localStorage entries", async ({page}) => {
    await page.addInitScript(() => {
      localStorage.setItem("darkMode", "{corrupt");
      localStorage.setItem("super-sudoku-user-preferences", "{corrupt");
      localStorage.setItem("super_sudoku_currently_playing_sudoku", "corrupt_key");
      localStorage.setItem("super_sudoku_1_6_corrupt_key", "{corrupt");
    });
    await page.goto("/");
    await expect(page.getByTestId("sudoku-board")).toBeVisible();
    await expect(page.getByTestId("current-game-label")).toHaveText("Easy #1");
  });

  test("rejects unsolvable and non-unique custom puzzles without locking the creator", async ({page}) => {
    await page.goto("/#/select-game");
    page.once("dialog", async (dialog) => {
      await dialog.accept("Validation test");
    });
    await page.getByRole("button", {name: "+ New Collection"}).click();
    await page.getByRole("button", {name: "Add sudoku +"}).click();

    // Empty board has multiple solutions
    await page.getByRole("button", {name: "Save sudoku"}).click();
    await expect(page.getByText("This sudoku is not unique. It has multiple solutions.")).toBeVisible();
    await expect(page.getByRole("button", {name: "Save sudoku"})).toBeEnabled();

    // Conflicting clues make it unsolvable
    await selectCell(page, 0, 0);
    await page.keyboard.press("5");
    await selectCell(page, 1, 0);
    await page.keyboard.press("5");
    await page.getByRole("button", {name: "Save sudoku"}).click();
    await expect(page.getByText("This sudoku is not solvable.")).toBeVisible();
    await expect(page.getByRole("button", {name: "Save sudoku"})).toBeEnabled();
  });

  test("clear button cancels cleanly and confirms full reset across reload", async ({page}) => {
    await page.clock.install();
    await openGame(page);
    await selectCell(page, 5, 0);
    await page.keyboard.press("1");
    await expect(cellValue(page, 5, 0)).toHaveText("1");
    await page.clock.fastForward(4000);
    await expect(page.getByText("00:04 min", {exact: true})).toBeVisible();

    // Cancel clear: keeps move and resumes running
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.dismiss();
    });
    await page.getByRole("button", {name: "Clear"}).click();
    await page.clock.fastForward(50);
    await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
    await expect(cellValue(page, 5, 0)).toHaveText("1");

    // Confirm clear: resets board and timer, persists across reload
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });
    await page.getByRole("button", {name: "Clear"}).click();
    await page.clock.fastForward(50);
    await expect(cellValue(page, 5, 0)).toBeEmpty();
    await expect(page.getByText("00:00 min", {exact: true})).toBeVisible();

    await page.reload();
    await continueIfPaused(page);
    await expect(cellValue(page, 5, 0)).toBeEmpty();
  });

  test("shows custom collection display name in switch confirmation and supports deleting collections", async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto("/#/select-game");
    await storeCollection(page, "custom-uuid-123", "Weekend Pack", [FIRST_PUZZLE]);
    await openGame(page, FIRST_PUZZLE, 1, "custom-uuid-123", "Weekend Pack");
    await page.clock.fastForward(7000);

    const messages: string[] = [];
    page.on("dialog", async (dialog) => {
      messages.push(dialog.message());
      await dialog.accept();
    });

    await page.getByRole("button", {name: "New game"}).click();
    await page.getByRole("button", {name: "Easy"}).click();
    await page.getByTestId("sudoku-preview-2").click();
    await expect(page.getByTestId("current-game-label")).toHaveText("Easy #2");
    expect(messages[0]).toContain("Weekend Pack #1");
    expect(messages[0]).not.toContain("custom-uuid-123");

    // Delete the custom collection and verify clean fallback
    await page.getByRole("button", {name: "New game"}).click();
    await page.getByRole("button", {name: "Weekend Pack"}).click();
    await page.getByRole("button", {name: "Delete collection"}).click();
    await expect(page.getByRole("button", {name: "Weekend Pack"})).toHaveCount(0);
    await expect(page.getByTestId("sudoku-preview-1")).toBeVisible();
  });

  test("paginates through collection pages and opens puzzles from later pages", async ({page}) => {
    await page.goto("/#/select-game");
    await expect(page.getByTestId("sudoku-preview-1")).toBeVisible();
    await expect(page.getByRole("button", {name: "Previous page"})).toBeDisabled();

    await page.getByRole("button", {name: "Next page"}).click();
    await expect(page.getByTestId("sudoku-preview-13")).toBeVisible();
    await expect(page.getByRole("button", {name: "2", exact: true})).toHaveAttribute("aria-current", "page");

    await page.getByTestId("sudoku-preview-13").click();
    await expect(page.getByTestId("current-game-label")).toHaveText("Easy #13");
  });

  test("ignores benign ResizeObserver window errors and recovers from structurally invalid saved boards", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.addInitScript((puzzle) => {
      localStorage.setItem("super_sudoku_currently_playing_sudoku", puzzle);
      localStorage.setItem("super_sudoku_1_6_" + puzzle, JSON.stringify({game: {}, sudoku: []}));
    }, FIRST_PUZZLE);

    await page.goto("/");
    await expect(page.getByTestId("sudoku-board")).toBeVisible();
    await expect(page.locator("[data-testid^='sudoku-cell-0-']")).toHaveCount(9);

    // Dispatch a benign ResizeObserver loop error event and verify the app does not crash
    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {message: "ResizeObserver loop completed with undelivered notifications."}),
      );
    });
    await expect(page.getByTestId("sudoku-board")).toBeVisible();
    await expect(page.getByText("Something went wrong")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test("supports keyboard navigation, Delete, Undo, and Ctrl+Shift+Z Redo in the custom sudoku creator", async ({
    page,
  }) => {
    await page.goto("/#/select-game");
    page.once("dialog", async (dialog) => {
      await dialog.accept("Keyboard Creator");
    });
    await page.getByRole("button", {name: "+ New Collection"}).click();
    await page.getByRole("button", {name: "Add sudoku +"}).click();

    await page.keyboard.press("ArrowRight");
    await expect(cell(page, 0, 0)).toHaveAttribute("data-cell-active", "true");
    await page.keyboard.press("ArrowRight");
    await expect(cell(page, 1, 0)).toHaveAttribute("data-cell-active", "true");
    await page.keyboard.press("9");
    await expect(cellValue(page, 1, 0)).toHaveText("9");
    await page.keyboard.press("Delete");
    await expect(cellValue(page, 1, 0)).toBeEmpty();
    await page.keyboard.press(`${SHORTCUT_MODIFIER}+Z`);
    await expect(cellValue(page, 1, 0)).toHaveText("9");
    await page.keyboard.press(`${SHORTCUT_MODIFIER}+Shift+Z`);
    await expect(cellValue(page, 1, 0)).toBeEmpty();
  });

  test("plays and wins cleanly on a mobile viewport without horizontal overflow", async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    await openGame(page, ONE_EMPTY_CELL_PUZZLE);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);

    await selectCell(page, 8, 8);
    await expect(page.getByTestId("sudoku-menu-circle")).toBeHidden();
    await page.getByRole("button", {name: "Set 7"}).click();
    await expect(page.getByText(/Congrats, you won/)).toBeVisible();
  });

  test("syncs dark mode across open tabs", async ({page, context}) => {
    await openGame(page);
    const secondTab = await context.newPage();
    await openGame(secondTab);

    await page.getByRole("button", {name: "Toggle dark mode"}).click();
    await expect(page.locator("body")).toHaveClass(/dark/);
    await expect(secondTab.locator("body")).toHaveClass(/dark/);
  });

  test("switches themes independently of light/dark mode, persists across reloads, and syncs across tabs", async ({
    page,
    context,
  }) => {
    await openGame(page);

    // Default theme in light mode uses a bright light canvas instead of dark gray.
    await expect(page.locator("html")).toHaveAttribute("data-theme", "default");
    await expect(page.locator("html")).toHaveAttribute("data-color-mode", "light");
    const lightCanvasBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(lightCanvasBg).toBe("rgb(241, 245, 249)");

    const secondTab = await context.newPage();
    await openGame(secondTab);

    await openSettings(page);
    await page.getByTestId("theme-option-paper").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
    await expect(page.locator("html")).toHaveAttribute("data-color-mode", "light");
    await expect(page.locator("body")).not.toHaveClass(/dark/);
    await expect(secondTab.locator("html")).toHaveAttribute("data-theme", "paper");

    // Toggling dark mode keeps the active Paper theme and switches to its dark palette.
    await page.getByRole("button", {name: "Toggle dark mode"}).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
    await expect(page.locator("html")).toHaveAttribute("data-color-mode", "dark");
    await expect(page.locator("body")).toHaveClass(/dark/);
    await expect(secondTab.locator("html")).toHaveAttribute("data-theme", "paper");
    await expect(secondTab.locator("html")).toHaveAttribute("data-color-mode", "dark");

    // Switching to High Contrast stays in dark mode and persists across reload.
    await page.getByTestId("theme-option-high-contrast").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "high-contrast");
    await expect(page.locator("html")).toHaveAttribute("data-color-mode", "dark");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "high-contrast");
    await expect(page.locator("html")).toHaveAttribute("data-color-mode", "dark");
    await expect(page.locator("body")).toHaveClass(/dark/);
  });

  test("opens Shortcuts and About modals without pausing on Escape and toggles settings panel", async ({page}) => {
    await openGame(page);

    await page.getByRole("button", {name: "Shortcuts", exact: true}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", {name: "Shortcuts"})).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByTestId("continue-overlay")).toBeHidden();

    await page.getByRole("button", {name: "About", exact: true}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", {name: "About"})).toBeVisible();
    await page.getByRole("button", {name: "Close"}).click();
    await expect(page.getByRole("dialog")).toBeHidden();

    const settingsToggle = page.getByRole("button", {name: "Settings"});
    await expect(page.locator("#generated_notes")).toBeHidden();
    await settingsToggle.click();
    await expect(page.locator("#generated_notes")).toBeVisible();
    await settingsToggle.click();
    await expect(page.locator("#generated_notes")).toBeHidden();
  });

  test("hides the timer via Settings, persists across reload, and still tracks elapsed time", async ({page}) => {
    await page.clock.install();
    await openGame(page);
    await expect(page.getByTestId("game-timer")).toBeVisible();

    await openSettings(page);
    await page.locator("#show_timer").uncheck();
    await expect(page.getByTestId("game-timer")).toHaveCount(0);

    await page.clock.fastForward(4000);

    await page.reload();
    await continueIfPaused(page);
    await expect(page.getByTestId("game-timer")).toHaveCount(0);

    await openSettings(page);
    await expect(page.locator("#show_timer")).not.toBeChecked();
    await page.locator("#show_timer").check();
    await expect(page.getByTestId("game-timer")).toHaveText("00:04 min");
  });
});
