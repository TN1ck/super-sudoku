import * as React from "react";
import {setNumber, setNote} from "src/ducks/sudoku";
import {SUDOKU_NUMBERS, Cell} from "src/engine/utility";
import THEME from "src/theme";
import styled from "styled-components";

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

const NumberContainer = styled.div`
  /* background: ${THEME.colors.white}; */
  position: relative;
  border: 1px solid transparent;
  background: white;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;

  &:hover {
    border: 1px solid ${THEME.colors.primary};
  }
`;

const ResponsiveNumber = ({children, onClick}) => {
  return <NumberContainer onClick={onClick}>{children}</NumberContainer>;
};

export interface SudokuMenuNumbersStateProps {
  notesMode: boolean;
  activeCell: Cell;
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
            <ResponsiveNumber onClick={() => this.props.setNumber(this.props.activeCell, n)} key={n}>
              {n}
            </ResponsiveNumber>
          );
        })}
      </SudokuMenuNumbersContainer>
    );
  }
}

export default SudokuMenuNumbers;
