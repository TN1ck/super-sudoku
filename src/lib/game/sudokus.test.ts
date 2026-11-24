import {describe, expect, it, vi} from "vite-plus/test";
import {BaseCollection} from "../database/collections";
import {stringifySudoku} from "../engine/utility";
import {extractPuzzleLines, slicePuzzleChunk} from "../../../scripts/sudokuChunksPlugin";
import {
  getBaseCollectionCount,
  getBaseCollectionPageSync,
  getCustomCollectionPage,
  getSudokusPaginated,
  loadBaseCollectionChunk,
  loadBaseCollectionPage,
  loadCollectionPuzzleRaw,
  START_SUDOKU,
  SUDOKU_CHUNK_SIZE,
} from "./sudokus";

describe("collection pagination", () => {
  it("counts and pages the same puzzles across blank lines and Windows line endings", () => {
    const first = "534920700060007309900000010008700000496803002721594806000200940800046100003000000";
    const second = "534921768162487359987635214358762491496813572721594836615278943879346125243159680";
    const collection = {id: "pair", name: "Pair", sudokusRaw: [first, "  ", second, ""].join("\r\n")};
    const page = getSudokusPaginated(collection, 1, 1);
    expect(page).toMatchObject({totalRows: 2, totalPages: 2});
    expect(page.sudokus.map(({sudoku}) => stringifySudoku(sudoku))).toEqual([second]);
    expect(getSudokusPaginated(collection, 0, 12).sudokus).toHaveLength(2);
  });

  it("skips corrupted puzzle lines without crashing", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const valid = "534920700060007309900000010008700000496803002721594806000200940800046100003000000";
    const collection = {id: "mixed", name: "Mixed", sudokusRaw: ["corrupted-line", valid].join("\n")};
    const page = getSudokusPaginated(collection, 0, 12);
    expect(page.sudokus).toHaveLength(1);
    expect(stringifySudoku(page.sudokus[0].sudoku)).toBe(valid);
  });

  it("paginates custom collection previews without solving every puzzle", () => {
    const first = "534920700060007309900000010008700000496803002721594806000200940800046100003000000";
    const second = "534921768162487359987635214358762491496813572721594836615278943879346125243159680";
    const collection = {id: "custom-pair", name: "Custom", sudokusRaw: `${first}\n${second}`};
    const page = getCustomCollectionPage(collection, 0, 12);
    expect(page).toMatchObject({totalRows: 2, totalPages: 1});
    expect(page.sudokus.map((item) => item.raw)).toEqual([first, second]);
  });
});

describe("chunked base collections", () => {
  it("extracts lines and slices chunks cleanly", () => {
    const lines = extractPuzzleLines("a\r\n  \nb\n c \n");
    expect(lines).toEqual(["a", "b", "c"]);
    expect(slicePuzzleChunk(lines, 0, 2)).toEqual(["a", "b"]);
    expect(slicePuzzleChunk(lines, 1, 2)).toEqual(["c"]);
    expect(slicePuzzleChunk(lines, 2, 2)).toEqual([]);
  });

  it("loads base collection pages on demand and caches chunks for synchronous reuse", async () => {
    const easyCount = getBaseCollectionCount(BaseCollection.Easy);
    expect(easyCount).toBeGreaterThanOrEqual(600);

    const firstPage = await loadBaseCollectionPage(BaseCollection.Easy, 0, 12);
    expect(firstPage.totalRows).toBe(easyCount);
    expect(firstPage.sudokus).toHaveLength(12);
    expect(firstPage.sudokus[0].raw).toBe(stringifySudoku(START_SUDOKU.sudoku));

    // Once chunk 0 is loaded, subsequent page reads inside chunk 0 are synchronous.
    const secondPageSync = getBaseCollectionPageSync(BaseCollection.Easy, 1, 12);
    expect(secondPageSync).not.toBeNull();
    expect(secondPageSync?.sudokus).toHaveLength(12);
    expect(secondPageSync?.sudokus[0].raw).not.toBe(firstPage.sudokus[0].raw);
  });

  it("loads puzzles across chunk boundaries", async () => {
    const evilCount = getBaseCollectionCount(BaseCollection.Evil);
    expect(evilCount).toBeGreaterThan(SUDOKU_CHUNK_SIZE);

    const chunk1 = await loadBaseCollectionChunk(BaseCollection.Evil, 1);
    expect(chunk1.length).toBe(evilCount - SUDOKU_CHUNK_SIZE);

    const firstInSecondChunk = await loadCollectionPuzzleRaw(BaseCollection.Evil, SUDOKU_CHUNK_SIZE, () => ({
      id: BaseCollection.Evil,
      name: BaseCollection.Evil,
    }));
    expect(firstInSecondChunk).toBe(chunk1[0]);

    const pastEnd = await loadCollectionPuzzleRaw(BaseCollection.Evil, evilCount, () => ({
      id: BaseCollection.Evil,
      name: BaseCollection.Evil,
    }));
    expect(pastEnd).toBeNull();
  });
});
