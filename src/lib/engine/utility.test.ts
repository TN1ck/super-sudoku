import {describe, expect, it} from "vitest";
import {parseSudoku, stringifySudoku} from "./utility";

const rows = [
  "_1____674",
  "_897_____",
  "__2_638__",
  "_28___76_",
  "___1__43_",
  "__692__18",
  "_6_235___",
  "2__4_81_6",
  "57_______",
];

describe("parseSudoku", () => {
  it.each([
    {format: "Windows line endings", input: rows.join("\r\n")},
    {format: "padded rows and blank lines", input: rows.map((row) => `  ${row}\t`).join("\n \n")},
  ])("reads a multiline grid with $format", ({input}) => {
    expect(stringifySudoku(parseSudoku(input))).toBe(rows.join("").replaceAll("_", "0"));
  });

  it("rejects whitespace in place of a cell", () => {
    expect(() => parseSudoku(["_1 ___674", ...rows.slice(1)].join("\n"))).toThrow();
  });
});
