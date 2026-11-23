import React from "react";
import {SimpleSudoku} from "src/lib/engine/types";
import {SudokuGridLines} from "./SudokuGrid";

const BOARD_SIZE = 100;
const CELL_SECTION = BOARD_SIZE / 9;

interface SudokuPreviewProps {
  sudoku: SimpleSudoku;
  id: number;
  darken?: boolean;
  size?: number;
  onClick: () => void;
}

const SudokuPreview = React.memo(({sudoku, id, darken, size = 150, onClick}: SudokuPreviewProps) => {
  const fontSize = size / 16;

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      aria-label={`Select sudoku ${id}`}
      className="select-none hover:cursor-pointer group"
      data-testid={`sudoku-preview-${id}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div
        className="relative bg-gray-100 dark:bg-gray-700 rounded-sm"
        style={{
          height: size,
          width: size,
          fontSize,
          lineHeight: 1,
        }}
      >
        <div className="absolute z-10 top-0 left-0 w-full h-full flex items-center justify-center">
          <div style={{fontSize: size / 3}} className="font-bold text-black dark:text-white opacity-80">
            {id}
          </div>
        </div>
        <SudokuGridLines width={BOARD_SIZE} height={BOARD_SIZE} hideOuter thin />
        {sudoku.map((row, y) => (
          <div key={y}>
            {row.map((n, x) =>
              n !== 0 ? (
                <div
                  key={x}
                  className="text-black dark:text-white"
                  style={{
                    position: "absolute",
                    left: `${CELL_SECTION * (x + 0.5)}%`,
                    top: `${CELL_SECTION * (y + 0.5)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {n}
                </div>
              ) : null,
            )}
          </div>
        ))}
        {darken ? (
          <div className="absolute z-20 top-0 left-0 w-full h-full bg-black opacity-20 group-hover:opacity-0 transition-opacity duration-300" />
        ) : null}
      </div>
    </div>
  );
});

export default SudokuPreview;
