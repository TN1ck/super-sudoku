import React from "react";
import {SudokuSmall, SudokuSmallTitle, GridLineY, GridLineX} from "src/components/modules/Sudoku/Sudoku.styles";
import {SimpleSudoku} from "src/engine/utility";

export default class SmallSudokuComponent extends React.PureComponent<{
  sudoku: SimpleSudoku;
  id: number;
  darken?: boolean;
  elevation?: number;
}> {
  render() {
    const {sudoku, id, darken} = this.props;
    const containerHeight = 150;
    const containerWidth = 150;
    const height = 100;
    const width = 100;
    const fontSize = 8;

    const xSection = height / 9;
    const ySection = width / 9;
    const fontXOffset = xSection / 2 - 2;
    const fontYOffset = ySection / 2 - 4;

    return (
      <div style={{pointerEvents: "none", userSelect: "none"}}>
        <div
          style={{
            background: `rgba(255, 255, 255, ${darken ? 0.5 : 0})`,
            transition: "background 500ms ease-out",
            top: 0,
            left: 0,
            height,
            width,
            position: "absolute",
            zIndex: 6,
          }}
        />
        <SudokuSmall
          style={{
            height: containerHeight,
            width: containerWidth,
            fontSize,
            lineHeight: fontSize + "px",
          }}
        >
          <SudokuSmallTitle>{id}</SudokuSmallTitle>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
            const makeBold = i % 3 === 0;
            return <GridLineX key={i} width={width} top={(i * height) / 9} makeBold={makeBold} />;
          })}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
            const makeBold = i % 3 === 0;
            return <GridLineY key={i} height={height} left={(i * height) / 9} makeBold={makeBold} />;
          })}
          {sudoku.map((row, y) => {
            return (
              <div key={y}>
                {row.map((n, x) => {
                  return (
                    <div
                      key={x}
                      style={{
                        position: "absolute",
                        left: xSection * x + fontXOffset + "%",
                        top: ySection * y + fontYOffset + "%",
                      }}
                    >
                      {n !== 0 ? n : ""}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </SudokuSmall>
      </div>
    );
  }
}
