import React from "react";
import {SimpleSudoku} from "src/lib/engine/types";
import {SudokuGridLines} from "./SudokuGrid";

const BOARD_SIZE = 100;
const CELL_SECTION = BOARD_SIZE / 9;

interface SudokuPreviewProps {
  sudoku: SimpleSudoku;
  id: number;
  darken?: boolean;
  onClick: () => void;
}

const SudokuPreview = React.memo(({sudoku, id, darken, onClick}: SudokuPreviewProps) => {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      aria-label={`Select sudoku ${id}`}
      className="group w-full select-none hover:cursor-pointer"
      style={{containerType: "inline-size"}}
      data-testid={`sudoku-preview-${id}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div
        className="relative aspect-square w-full overflow-hidden rounded-sm border border-board-border/50 bg-board-bg shadow-sm"
        style={{
          fontSize: "6.25cqi",
          lineHeight: 1,
        }}
      >
        <SudokuGridLines width={BOARD_SIZE} height={BOARD_SIZE} hideOuter thin />
        {sudoku.map((row, y) => (
          <div key={y}>
            {row.map((n, x) =>
              n !== 0 ? (
                <div
                  key={x}
                  className="text-digit-given"
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
          <div className="absolute left-0 top-0 z-10 h-full w-full bg-ink/10 transition-opacity duration-300 group-hover:opacity-0" />
        ) : null}
        <div className="pointer-events-none absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center">
          <div style={{fontSize: "33.33cqi"}} className="font-bold text-ink opacity-85">
            {id}
          </div>
        </div>
      </div>
    </div>
  );
});

export default SudokuPreview;
