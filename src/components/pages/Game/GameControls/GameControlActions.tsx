import * as React from "react";
import {clearCell, getHint} from "src/state/sudoku";
import THEME from "src/theme";
import styled from "styled-components";
import {activateNotesMode, deactivateNotesMode} from "src/state/game";
import Button from "../../../modules/Button";
import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";

const ControlsButton = styled(Button)`
  width: 100%;
  padding-left: 0;
  padding-right: 0;
`;

const ControlContainer = styled.div`
  position: relative;
  justify-content: center;
  display: flex;
`;

const SudokuMenuControlsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: ${THEME.spacer.x1}px;
  width: 100%;
  margin-top: ${THEME.spacer.x3}px;
`;

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
      <SudokuMenuControlsContainer>
        <ControlContainer
          onClick={() => (this.props.notesMode ? this.props.deactivateNotesMode() : this.props.activateNotesMode())}
        >
          <ControlsButton>{`Notes ${this.props.notesMode ? "ON" : "OFF"}`}</ControlsButton>
        </ControlContainer>
        <ControlContainer onClick={() => this.props.clearCell(this.props.activeCell!)}>
          <ControlsButton>{"Erase"}</ControlsButton>
        </ControlContainer>
        <ControlContainer>
          <ControlsButton onClick={() => this.props.getHint(this.props.activeCell!)}>{"Hint"}</ControlsButton>
        </ControlContainer>
      </SudokuMenuControlsContainer>
    );
  }
}

export default connector(SudokuMenuControls);
