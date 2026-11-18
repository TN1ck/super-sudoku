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

async function selectCell(page: Page, x: number, y: number) {
  await cell(page, x, y).click();
  await expect(cell(page, x, y)).toHaveAttribute("data-cell-active", "true");
}

async function enterSudokuValues(
  page: Page,
  values: string,
  shouldEnter: (value: string, index: number) => boolean = (value) => value !== "0",
) {
  for (const [index, value] of [...values].entries()) {
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

test.beforeEach(async ({context}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {origin: "http://127.0.0.1:4173"});
});

test("uses the application name as the browser tab title", async ({page}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Super Sudoku");
});

test("rejects an invalid puzzle link once and restores the current puzzle URL", async ({page}) => {
  const dialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.type());
    await dialog.dismiss();
  });
  await page.goto(gameUrl("invalid"));
  await expect(page).toHaveURL(new RegExp(FIRST_PUZZLE));
  await continueIfPaused(page);
  await expect(cellValue(page, 0, 0)).toHaveText("5");
  expect(dialogs).toEqual(["alert"]);
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
