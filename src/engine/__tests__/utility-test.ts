import * as utility from "../utility";

describe("parseSudoku / printSudoku", () => {
  test("should parse and print a sudoku correctly", () => {
    const sudoku = utility.solvableSudoku1;
    const parsedSudoku = utility.parseSudoku(sudoku);
    const printedSudoku = utility.printSimpleSudoku(parsedSudoku);
    expect(printedSudoku).toBe(sudoku);
  });

  test("should throw an exception when the input contains wrong characters", () => {
    expect(() => utility.parseSudoku("wrong")).toThrow();
  });

  test("should throw an exception when the input contains invalid line numbers", () => {
    expect(() =>
      utility.parseSudoku(
        ["_1____674", "_897_____", "__2_638__", "_28___76_", "___1__43_", "__692__18", "_6_235___", "2__4_81_6"].join(
          "\n",
        ),
      ),
    ).toThrow();
  });

  test("should throw an exception when the input contains invalid amount of characters per line", () => {
    expect(() =>
      utility.parseSudoku(
        [
          "_1____67",
          "_897_____",
          "__2_638__",
          "_28___76_",
          "___1__43_",
          "__692__18",
          "_6_235___",
          "2__4_81_6",
          "57_______",
        ].join("\n"),
      ),
    ).toThrow();
  });
});
