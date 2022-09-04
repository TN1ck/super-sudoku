import * as React from "react";
import {clearCell, getHint} from "src/state/sudoku";
import styled from "styled-components";
import {activateNotesMode, deactivateNotesMode} from "src/state/game";
import Button from "../../../modules/Button";
import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";
import clsx from "clsx";

const ControlContainer = styled.div.attrs({className: "relative justify-center flex"})``;

const connector = connect(
  (state: RootState) => ({
    notesMode: state.game.notesMode,
    activeCell: state.game.activeCellCoordinates,
  }),
  {
    clearCell,
    deactivateNotesMode,
    activateNotesMode,
    getHint,
  },
);
type PropsFromRedux = ConnectedProps<typeof connector>;

class SudokuMenuControls extends React.Component<PropsFromRedux> {
  render() {
    return (
      <div className="mt-4 grid w-full grid-cols-3 gap-2">
        <ControlContainer>
          <Button
            onClick={() => (this.props.notesMode ? this.props.deactivateNotesMode() : this.props.activateNotesMode())}
            className={clsx("w-full", {
              "bg-teal-700 text-white": !this.props.notesMode,
              "bg-sky-700 text-white": this.props.notesMode,
            })}
          >{`${this.props.notesMode ? "Notes ON" : "Notes OFF"}`}</Button>
        </ControlContainer>
        <ControlContainer>
          <Button className="w-full" onClick={() => this.props.clearCell(this.props.activeCell!)}>
            {"Erase"}
          </Button>
        </ControlContainer>
        <ControlContainer>
          <Button className="w-full" onClick={() => this.props.getHint(this.props.activeCell!)}>
            {"Hint"}
          </Button>
        </ControlContainer>
      </div>
    );
  }
}

export default connector(SudokuMenuControls);
