import {SimpleSudoku} from "./types";
import {parseSudoku} from "./utility";

// Cannot be included in the list test as it does not have a unique solution.
export const EMPTY_SUDOKU = parseSudoku(
  [
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
    "_________",
  ].join("\n"),
);

interface SolvedSudoku {
  unsolved: SimpleSudoku;
  solved: SimpleSudoku;
  description: string;
}

export const SOLVED_SUDOKUS: SolvedSudoku[] = [
  {
    description: "easy sudoku",
    unsolved: parseSudoku(
      [
        "_1____674",
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
    solved: parseSudoku(
      [
        "315892674",
        "689741325",
        "742563891",
        "128354769",
        "957186432",
        "436927518",
        "861235947",
        "293478156",
        "574619283",
      ].join("\n"),
    ),
  },
  {
    description: "easy sudoku #2",
    unsolved: parseSudoku(
      [
        "____3____",
        "__1_65___",
        "5__2___3_",
        "__869_2__",
        "__74_2__5",
        "13__7__6_",
        "______927",
        "_8_______",
        "_4_9_____",
      ].join("\n"),
    ),
    solved: parseSudoku(
      [
        "894731652",
        "321865794",
        "576249138",
        "458693271",
        "967412385",
        "132578469",
        "615384927",
        "789126543",
        "243957816",
      ].join("\n"),
    ),
  },
];
