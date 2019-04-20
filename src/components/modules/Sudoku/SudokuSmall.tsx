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
  size?: number;
}> {
  render() {
    const {sudoku, id, size = 150} = this.props;
    const containerHeight = size;
    const containerWidth = size;
    const height = 100;
    const width = 100;
    const fontSize = size / 16;

    const xSection = height / 9;
    const ySection = width / 9;

    return (
      <SudokuSmallContainer>
        <SudokuSmall
          style={{
            height: containerHeight,
            width: containerWidth,
            fontSize,
            lineHeight: 1,
          }}
          >
          <SudokuSmallTitle style={{fontSize: size / 3}}>{id}</SudokuSmallTitle>
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
                  return n !== 0 ? (
                    <div
                      key={x}
                      style={{
                        position: "absolute",
                        left: xSection * (x + 0.5) + "%",
                        top: ySection * (y + 0.5) + "%",
                        transform: "translate(-50%, -50%)"
                      }}
                    >
                      {n}
                    </div>
                  ) : null;
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
