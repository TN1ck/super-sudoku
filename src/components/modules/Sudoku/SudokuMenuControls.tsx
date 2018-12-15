import * as React from "react";
import {connect} from "react-redux";
import {clearCell} from "src/ducks/sudoku";
import {Cell} from "src/ducks/sudoku/model";
import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/ducks";
import {activateNotesMode, deactivateNotesMode} from "src/ducks/game";
import Button from "../Button";

const ControlsButton = styled(Button)`
  width: 100%;
  margin-left: ${THEME.spacer.x1}px;
  margin-right: ${THEME.spacer.x1}px;
`;

const ControlContainer = styled.div`
  position: relative;
  border: 1px solid transparent;
  justify-content: center;
  color: black;
  display: flex;
`;

const SudokuMenuControlsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  margin-top: ${THEME.spacer.x3}px;
  overflow: hidden;
`;

interface SudokuMenuControlsStateProps {
  notesMode: boolean;
  activeCell: Cell;
}

interface SudokuMenuControlsDispatchProps {
  clearCell: typeof clearCell;
  activateNotesMode: typeof activateNotesMode;
  deactivateNotesMode: typeof deactivateNotesMode;
}

class SudokuMenuControls extends React.Component<SudokuMenuControlsStateProps & SudokuMenuControlsDispatchProps> {
  render() {
    return (
      <SudokuMenuControlsContainer>
        <ControlContainer
          onClick={() => (this.props.notesMode ? this.props.deactivateNotesMode() : this.props.activateNotesMode())}
        >
          <ControlsButton>{`Notes ${this.props.notesMode ? "ON" : "OFF"}`}</ControlsButton>
        </ControlContainer>
        <ControlContainer onClick={() => this.props.clearCell(this.props.activeCell)}>
          <ControlsButton>{"Erase"}</ControlsButton>
        </ControlContainer>
        <ControlContainer>
          <ControlsButton>{"Hint"}</ControlsButton>
        </ControlContainer>
      </SudokuMenuControlsContainer>
    );
  }
}

const ConnectedSudokuMenuControls = connect<SudokuMenuControlsStateProps, SudokuMenuControlsDispatchProps>(
  (state: RootState) => ({
    notesMode: state.game.notesMode,
    activeCell: state.game.activeCell,
  }),
  {
    clearCell,
    deactivateNotesMode,
    activateNotesMode,
  },
)(SudokuMenuControls);

export default ConnectedSudokuMenuControls;
