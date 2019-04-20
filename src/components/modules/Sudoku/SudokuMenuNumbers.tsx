import * as React from "react";
import {connect} from "react-redux";
import {setNumber, setNote} from "src/ducks/sudoku";
import {SUDOKU_NUMBERS, Cell} from "src/engine/utility";
import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/ducks";

const NumberContainer = styled.div`
  /* background: ${THEME.colors.white}; */
  position: relative;
  border: 1px solid transparent;
  background: white;

  &:hover {
    border: 1px solid ${THEME.colors.primary};
  }
`;

const ActualNumber = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  color: black;
  transform: translate(-50%, -50%);
`;

const ResponsiveNumber = ({children, onClick}) => {
  return (
    <NumberContainer onClick={onClick}>
      <svg style={{width: "100%"}} width="22" height="32" />
      <ActualNumber>{children}</ActualNumber>
    </NumberContainer>
  );
};

const SudokuMenuNumbersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 6px;
  justify-content: center;
  width: 100%;
  margin-top: ${THEME.spacer.x3}px;
  overflow: hidden;

  @media (max-width: 800px) {
    grid-template-columns: repeat(9, 1fr);
  }
`;

interface SudokuMenuNumbersStateProps {
  notesMode: boolean;
  activeCell: Cell;
}

interface SudokuMenuNumbersDispatchProps {
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

const ConnectedSudokuMenuNumbers = connect<SudokuMenuNumbersStateProps, SudokuMenuNumbersDispatchProps>(
  (state: RootState) => ({
    notesMode: false,
    activeCell: state.game.activeCell,
  }),
  {
    setNumber,
    setNote,
  },
)(SudokuMenuNumbers);

export default ConnectedSudokuMenuNumbers;
