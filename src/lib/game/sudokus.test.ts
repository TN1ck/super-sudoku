import {describe, expect, it, vi} from "vitest";
import {getSudokusPaginated} from "./sudokus";
import {stringifySudoku} from "../engine/utility";

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
});
