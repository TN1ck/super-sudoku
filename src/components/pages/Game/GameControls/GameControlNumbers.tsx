import * as React from "react";
import {setNumber, setNote} from "src/ducks/sudoku";
import {SUDOKU_NUMBERS, CellCoordinates} from "src/engine/utility";
import THEME from "src/theme";
import styled from "styled-components";
import Button from "src/components/modules/Button";

const SudokuMenuNumbersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: ${THEME.spacer.x1}px;
  row-gap: ${THEME.spacer.x1}px;
  justify-content: center;
  width: 100%;
  overflow: hidden;

  @media (max-width: 800px) {
    margin-top: ${THEME.spacer.x3}px;
    grid-template-columns: repeat(9, 1fr);
  }
`;

const NumberButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 0;
  padding-right: 0;
`;

export interface SudokuMenuNumbersStateProps {
  notesMode: boolean;
  activeCell: CellCoordinates;
}

export interface SudokuMenuNumbersDispatchProps {
  setNumber: typeof setNumber;
  setNote: typeof setNote;
}

class SudokuMenuNumbers extends React.Component<SudokuMenuNumbersStateProps & SudokuMenuNumbersDispatchProps> {
  render() {
    return (
      <SudokuMenuNumbersContainer>
        {SUDOKU_NUMBERS.map(n => {
          return (
            <NumberButton onClick={() => this.props.setNumber(this.props.activeCell, n)} key={n}>
              {n}
            </NumberButton>
          );
        })}
      </SudokuMenuNumbersContainer>
    );
  }
}

export default SudokuMenuNumbers;
