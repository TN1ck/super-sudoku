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
      className="group select-none hover:cursor-pointer"
      data-testid={`sudoku-preview-${id}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div
        className="relative rounded-sm bg-gray-100 dark:bg-gray-700"
        style={{
          height: size,
          width: size,
          fontSize,
          lineHeight: 1,
        }}
      >
        <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center">
          <div style={{fontSize: size / 3}} className="font-bold text-black opacity-80 dark:text-white">
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
          <div className="duration-300 absolute left-0 top-0 z-20 h-full w-full bg-black opacity-20 transition-opacity group-hover:opacity-0" />
        ) : null}
      </div>
    </div>
  );
});

export default SudokuPreview;
