import {expect, Page, test} from "@playwright/test";

const FIRST_PUZZLE =
  "534920700060007309900000010008700000496803002721594806000200940800046100003000000";
const FIRST_SOLUTION =
  "534921768162487359987635214358762491496813572721594836615278943879346125243159687";
const ONE_EMPTY_CELL_PUZZLE = `${FIRST_SOLUTION.slice(0, -1)}0`;
const SHORTCUT_MODIFIER = "Control";

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
  await page.getByRole("button", {name: "Select next sudoku: Easy #2"}).click();

  await expect(page.getByTestId("current-game-label")).toHaveText("Easy #2");
  await expect(page.getByText(/Congrats, you won/)).toHaveCount(0);
  await expect(page).toHaveURL(/sudokuCollectionName=easy/);
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
