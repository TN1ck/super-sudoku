import * as React from "react";
import {setNumber, setNote, SudokuState} from "src/state/sudoku";
import {SUDOKU_NUMBERS} from "src/engine/utility";
import {CellCoordinates} from "src/engine/types";
import styled from "styled-components";
import Button from "src/components/modules/Button";
import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";
import clsx from "clsx";

const SudokuMenuNumbersContainer = styled.div.attrs({
  className: "grid w-full overflow-hidden justify-center gap-2 md:grid-cols-3 grid-cols-9 md:mt-0 mt-4",
})``;

const NumberButton = styled(Button).attrs({
  className: "flex justify-center items-center px-0",
})`` as typeof Button;

export interface SudokuMenuNumbersStateProps {
  notesMode: boolean;
  activeCell: CellCoordinates;
  sudoku: SudokuState;
}

export interface SudokuMenuNumbersDispatchProps {
  setNumber: typeof setNumber;
  setNote: typeof setNote;
}

const connector = connect(
  (state: RootState) => ({
    notesMode: state.game.notesMode,
    activeCell: state.game.activeCellCoordinates,
    sudoku: state.sudoku,
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
          const occurrences = this.props.sudoku.filter((c) => c.number === n).length;

          const setNumberOrNote = () => {
            if (this.props.notesMode) {
              this.props.setNote(this.props.activeCell!, n);
            } else {
              this.props.setNumber(this.props.activeCell!, n);
            }
          };
          return (
            <NumberButton
              className={clsx("relative font-bold", {
                "bg-gray-400": occurrences == 9,
                "bg-red-400": occurrences > 9,
              })}
              onClick={setNumberOrNote}
              key={n}
            >
              <div className="absolute right-1 bottom-1 h-3 w-3 rounded-xl bg-teal-700 text-xxs text-white opacity-70 sm:h-4 sm:w-4 sm:text-xs ">
                {occurrences}
              </div>
              {n}
            </NumberButton>
          );
        })}
      </SudokuMenuNumbersContainer>
    );
  }
}

export default connector(SudokuMenuNumbers);
