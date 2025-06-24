import React from "react";
import {SimpleSudoku} from "src/lib/engine/types";

const GridLineX = ({top, width, makeBold}: {top: number; width: number; makeBold: boolean}) => (
  <div
    className={`absolute left-0 h-px transform -translate-y-1/2 ${makeBold ? "bg-gray-400 dark:bg-gray-400" : "bg-gray-200 dark:bg-gray-600"}`}
    style={{
      width: `${width}%`,
      top: `${top}%`,
    }}
  />
);

const GridLineY = ({left, height, makeBold}: {left: number; height: number; makeBold: boolean}) => (
  <div
    className={`absolute top-0 w-px transform -translate-x-1/2 ${makeBold ? "bg-gray-400 dark:bg-gray-400" : "bg-gray-200 dark:bg-gray-600"}`}
    style={{
      height: `${height}%`,
      left: `${left}%`,
    }}
  />
);

const SudokuPreviewGrid = React.memo(
  ({width, height, hideLeftRight = false}: {width: number; height: number; hideLeftRight?: boolean}) => {
    return (
      <div>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const hide = [0, 9].includes(i);
          if (hideLeftRight && hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineX makeBold={makeBold} key={i} width={width} top={(i * height) / 9} />;
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const hide = [0, 9].includes(i);
          if (hideLeftRight && hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineY makeBold={makeBold} key={i} height={height} left={(i * height) / 9} />;
        })}
      </div>
    );
  },
);

export default class SudokuPreview extends React.PureComponent<{
  sudoku: SimpleSudoku;
  id: number;
  darken?: boolean;
  size?: number;
  onClick: () => void;
}> {
  render() {
    const {sudoku, id, onClick, size = 150} = this.props;
    const containerHeight = size;
    const containerWidth = size;
    const height = 100;
    const width = 100;
    const fontSize = size / 16;

    const xSection = height / 9;
    const ySection = width / 9;

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") {
        onClick();
      }
    };

    return (
      <div
        className="user-select-none hover:cursor-pointer group"
        tabIndex={id + 4}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <div
          className="relative bg-gray-100 dark:bg-gray-700 rounded-sm"
          style={{
            height: containerHeight,
            width: containerWidth,
            fontSize,
            lineHeight: 1,
          }}
        >
          <div className="absolute z-10 top-0 left-0 w-full h-full flex items-center justify-center">
            <div style={{fontSize: size / 3}} className="font-bold text-black dark:text-white opacity-80">
              {id}
            </div>
          </div>
          <SudokuPreviewGrid width={width} height={height} hideLeftRight />
          {sudoku.map((row, y) => {
            return (
              <div key={y}>
                {row.map((n, x) => {
                  return n !== 0 ? (
                    <div
                      key={x}
                      className="text-black dark:text-white"
                      style={{
                        position: "absolute",
                        left: xSection * (x + 0.5) + "%",
                        top: ySection * (y + 0.5) + "%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {n}
                    </div>
                  ) : null;
                })}
              </div>
            );
          })}
          {this.props.darken ? (
            <div className="absolute z-20 top-0 left-0 w-full h-full bg-black opacity-20 group-hover:opacity-0 transition-opacity duration-300" />
          ) : null}
        </div>
      </div>
    );
  }
}
