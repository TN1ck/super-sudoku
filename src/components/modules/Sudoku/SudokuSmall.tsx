import React from "react";
import {SudokuSmall, SudokuSmallTitle, GridLineY, GridLineX} from "src/components/modules/Sudoku/Sudoku.styles";
import {SimpleSudoku} from "src/engine/utility";
import styled from "styled-components";

const SudokuSmallContainer = styled.div`
  user-select: none;
`;

const SudokuSmallDarken = styled.div`
  position: absolute;
  background: black;
  height: 100%;
  width: 100%;
  opacity: 0.2;
  z-index: 9;

  &:hover {
    opacity: 0;
  }
`;

export default class SmallSudokuComponent extends React.PureComponent<{
  sudoku: SimpleSudoku;
  id: number;
  darken?: boolean;
}> {
  render() {
    const {sudoku, id} = this.props;
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
      <SudokuSmallContainer>
        <SudokuSmall
          style={{
            height: containerHeight,
            width: containerWidth,
            fontSize,
            lineHeight: fontSize + "px",
          }}
        >
          <SudokuSmallTitle>{id}</SudokuSmallTitle>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
            const makeBold = i % 3 === 0;
            return <GridLineX key={i} width={width} top={(i * height) / 9} makeBold={makeBold} />;
          })}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
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
          {this.props.darken ? <SudokuSmallDarken /> : null}
        </SudokuSmall>
      </SudokuSmallContainer>
    );
  }
}
