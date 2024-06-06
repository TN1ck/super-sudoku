import * as React from "react";
import {setNumber, setNotes, SudokuState} from "src/state/sudoku";
import {SUDOKU_NUMBERS} from "src/engine/utility";
import {CellCoordinates} from "src/engine/types";
import styled from "styled-components";
import Button from "src/components/modules/Button";
import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";
import clsx from "clsx";
import SudokuGame from "src/sudoku-game/SudokuGame";

const SudokuMenuNumbersContainer = styled.div.attrs({
  className: "grid w-full overflow-hidden justify-center gap-2 md:grid-cols-3 grid-cols-9 md:mt-0 mt-4",
})``;

const NumberButton = styled(Button).attrs({
  className: "flex justify-center items-center px-0",
})`` as typeof Button;

export interface SudokuMenuNumbersStateProps {
  notesMode: boolean;
  activeCell: CellCoordinates;
  showOccurrences: boolean;
  sudoku: SudokuState;
}

export interface SudokuMenuNumbersDispatchProps {
  setNumber: typeof setNumber;
  setNotes: typeof setNotes;
}

const connector = connect(
  (state: RootState) => ({
    notesMode: state.game.notesMode,
    showOccurrences: state.game.showOccurrences,
    activeCell: state.game.activeCellCoordinates,
    sudoku: state.sudoku,
    showHints: state.game.showHints,
  }),
  {
    setNumber,
    setNotes,
  },
);
type PropsFromRedux = ConnectedProps<typeof connector>;

class SudokuMenuNumbers extends React.Component<PropsFromRedux> {
  render() {
    return (
      <SudokuMenuNumbersContainer>
        {SUDOKU_NUMBERS.map((n) => {
          const occurrences = this.props.sudoku.filter((c) => c.number === n).length;

          const conflicting = SudokuGame.conflictingFields(this.props.sudoku);

          const activeCell = this.props.activeCell
            ? this.props.sudoku[this.props.activeCell.y * 9 + this.props.activeCell.x]
            : undefined;
          const userNotes = activeCell?.notes ?? [];
          const conflictingCell = this.props.activeCell
            ? conflicting[this.props.activeCell.y * 9 + this.props.activeCell.x]
            : undefined;
          const autoNotes = (this.props.showHints ? conflictingCell?.possibilities : []) ?? [];

          const setNumberOrNote = () => {
            if (this.props.notesMode) {
              const startingNotes = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;

              const newNotes = startingNotes.includes(n)
                ? startingNotes.filter((note) => note !== n)
                : [...userNotes, n];
              this.props.setNotes(this.props.activeCell!, newNotes);
            } else {
              this.props.setNumber(this.props.activeCell!, n);
            }
          };

          return (
            <NumberButton
              className={clsx("relative font-bold", {
                "bg-gray-400": occurrences == 9,
                "bg-red-400": this.props.showOccurrences && occurrences > 9,
                "bg-sky-600 text-white": this.props.notesMode && userNotes.includes(n) && activeCell?.number === 0,
                "bg-sky-300":
                  this.props.notesMode &&
                  userNotes.length === 0 &&
                  autoNotes.includes(n) &&
                  !userNotes.includes(n) &&
                  activeCell?.number === 0,
              })}
              onClick={setNumberOrNote}
              key={n}
            >
              {this.props.showOccurrences && (
                <div className="absolute right-0 bottom-0 h-3 w-3 rounded-xl bg-teal-700 text-xxs text-white opacity-70 sm:right-1 sm:bottom-1 sm:h-4 sm:w-4 sm:text-xs ">
                  {occurrences}
                </div>
              )}
              {/* {this.props.notesMode && this.props.showHints && autoNotes.includes(n) && (
                <div className="absolute font-normal left-1 top-1 h-3 w-3 rounded-xl text-xxs text-gray opacity-70 ">
                  {"auto"}
                </div>
              )} */}
              {n}
            </NumberButton>
          );
        })}
      </SudokuMenuNumbersContainer>
    );
  }
}

export default connector(SudokuMenuNumbers);
