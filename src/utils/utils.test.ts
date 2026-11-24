import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {formatDuration} from "./format";
import {createGameSearchParams, parseGameSearchParams} from "./gameUrl";
import {throttle} from "./throttle";
import {getVisiblePages} from "src/pages/Game/GameSelect";
import {
  areCellsEqual,
  cellsToSimpleSudoku,
  createEmptySimpleSudoku,
  parseSudoku,
  simpleSudokuToCells,
  SQUARE_TABLE,
  squareIndex,
  stringifySudoku,
} from "src/lib/engine/utility";

describe("formatDuration", () => {
  it("formats zero and standard durations", () => {
    expect(formatDuration(0)).toBe("00:00 min");
    expect(formatDuration(9)).toBe("00:09 min");
    expect(formatDuration(65.9)).toBe("01:05 min");
    expect(formatDuration(3661)).toBe("61:01 min");
  });

  it("clamps negative and non-finite inputs to 00:00", () => {
    expect(formatDuration(-10)).toBe("00:00 min");
    expect(formatDuration(Number.NaN)).toBe("00:00 min");
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("00:00 min");
  });
});

describe("gameUrl", () => {
  it("builds 1-based search params from a 0-based index", () => {
    expect(createGameSearchParams("0".repeat(81), 0, "easy")).toEqual({
      sudokuIndex: 1,
      sudoku: "0".repeat(81),
      sudokuCollectionName: "easy",
    });
  });

  it("rejects zero, negative, and non-integer sudokuIndex values", () => {
    expect(parseGameSearchParams({sudokuIndex: "0", sudoku: "abc", sudokuCollectionName: "easy"}).sudokuIndex).toBeUndefined();
    expect(parseGameSearchParams({sudokuIndex: "-2", sudoku: "abc", sudokuCollectionName: "easy"}).sudokuIndex).toBeUndefined();
    expect(parseGameSearchParams({sudokuIndex: "1.5", sudoku: "abc", sudokuCollectionName: "easy"}).sudokuIndex).toBeUndefined();
    expect(parseGameSearchParams({sudokuIndex: '"3"', sudoku: '"abc"', sudokuCollectionName: '"easy"'})).toEqual({
      sudokuIndex: 3,
      sudoku: "abc",
      sudokuCollectionName: "easy",
    });
  });
});

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes on leading and trailing edges, and supports flush and cancel", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);

    throttled("first");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith("first");

    throttled("second");
    throttled("third");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("third");

    throttled("fourth");
    throttled.flush();
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenLastCalledWith("fourth");

    throttled("cancelled");
    throttled.cancel();
    vi.advanceTimersByTime(2000);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe("getVisiblePages", () => {
  it("never omits a page without an ellipsis and never uses an ellipsis for a single page", () => {
    for (let pageCount = 1; pageCount <= 20; pageCount++) {
      for (let page = 0; page < pageCount; page++) {
        const visible = getVisiblePages(page, pageCount);
        expect(visible[0]).toBe(1);
        expect(visible[visible.length - 1]).toBe(pageCount);
        expect(visible).toContain(page + 1);

        for (let i = 1; i < visible.length; i++) {
          const prev = visible[i - 1];
          const curr = visible[i];
          if (typeof prev === "number" && typeof curr === "number") {
            expect(curr - prev).toBe(1);
          } else if (curr === "...") {
            const next = visible[i + 1];
            expect(typeof prev).toBe("number");
            expect(typeof next).toBe("number");
            expect((next as number) - (prev as number)).toBeGreaterThan(2);
          }
        }
      }
    }
  });
});

describe("engine utilities", () => {
  it("constructs SQUARE_TABLE with all 81 unique cells in row-major order per box", () => {
    expect(SQUARE_TABLE).toHaveLength(9);
    const seen = new Set<string>();
    SQUARE_TABLE.forEach((box, boxIdx) => {
      expect(box).toHaveLength(9);
      box.forEach(([x, y]) => {
        expect(squareIndex(x, y)).toBe(boxIdx);
        seen.add(`${x},${y}`);
      });
    });
    expect(seen.size).toBe(81);
  });

  it("parses single-line and multi-line grids with CRLF or surrounding whitespace", () => {
    const raw = "0".repeat(81);
    expect(stringifySudoku(parseSudoku(`  ${raw}\r\n`))).toBe(raw);
    const multiline = Array.from({length: 9}, () => "_________").join("\r\n");
    expect(stringifySudoku(parseSudoku(multiline))).toBe(raw);
    expect(() => parseSudoku("123")).toThrow();
    expect(() => parseSudoku("x".repeat(81))).toThrow();
  });

  it("compares Cell arrays accurately with areCellsEqual", () => {
    const a = simpleSudokuToCells(createEmptySimpleSudoku());
    const b = simpleSudokuToCells(createEmptySimpleSudoku());
    expect(areCellsEqual(a, b)).toBe(true);

    b[0] = {...b[0], notes: [1, 2]};
    expect(areCellsEqual(a, b)).toBe(false);

    a[0] = {...a[0], notes: [1, 2]};
    expect(areCellsEqual(a, b)).toBe(true);

    b[0] = {...b[0], autoNotesHidden: true};
    expect(areCellsEqual(a, b)).toBe(false);
  });

  it("ignores non-initial and out-of-bounds cells in cellsToSimpleSudoku", () => {
    const cells = simpleSudokuToCells(createEmptySimpleSudoku());
    cells[0] = {...cells[0], initial: true, number: 5};
    cells[1] = {...cells[1], initial: false, number: 9};
    const outOfBounds = {...cells[2], x: 99, y: -1, initial: true, number: 7};
    const simple = cellsToSimpleSudoku([...cells, outOfBounds]);
    expect(simple[0][0]).toBe(5);
    expect(simple[0][1]).toBe(0);
  });
});
