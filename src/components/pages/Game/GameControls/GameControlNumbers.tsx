import * as React from "react";
import {setNumber, setNote} from "src/state/sudoku";
import {SUDOKU_NUMBERS} from "src/engine/utility";
import {CellCoordinates} from "src/engine/types";
import THEME from "src/theme";
import styled from "styled-components";
import Button from "src/components/modules/Button";
import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";

const SudokuMenuNumbersContainer = styled.div.attrs({
  className: "grid w-full overflow-hidden justify-center gap-2"
})`
  grid-template-columns: 1fr 1fr 1fr;

  @media (max-width: 800px) {
    margin-top: ${16}px;
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

const connector = connect(
  (state: RootState) => ({
    notesMode: state.game.notesMode,
    activeCell: state.game.activeCellCoordinates,
  }),
  {
    setNumber,
    setNote,
  },
);
type PropsFromRedux = ConnectedProps<typeof connector>;

class SudokuMenuNumbers extends React.Component<PropsFromRedux> {
  render() {
    return (
      <SudokuMenuNumbersContainer>
        {SUDOKU_NUMBERS.map((n) => {
          const setNumberOrNote = () => {
            if (this.props.notesMode) {
              this.props.setNote(this.props.activeCell!, n);
            } else {
              this.props.setNumber(this.props.activeCell!, n);
            }
          };
          return (
            <NumberButton onClick={setNumberOrNote} key={n}>
              {n}
            </NumberButton>
          );
        })}
      </SudokuMenuNumbersContainer>
    );
  }
}

export default connector(SudokuMenuNumbers);
