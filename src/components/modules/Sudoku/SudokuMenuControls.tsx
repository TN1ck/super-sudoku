import * as React from "react";
import {connect} from "react-redux";
import {clearCell, getHint} from "src/ducks/sudoku";
import THEME from "src/theme";
import styled from "styled-components";
import {RootState} from "src/ducks";
import {activateNotesMode, deactivateNotesMode, activateSettings} from "src/ducks/game";
import Button from "../Button";
import {Cell} from "src/engine/utility";

const ControlsButton = styled(Button)`
  width: 100%;
`;

const ControlContainer = styled.div`
  position: relative;
  border: 1px solid transparent;
  justify-content: center;
  color: black;
  display: flex;

  &:hover {
    border: 1px solid ${THEME.colors.primary};
  }
`;

const SudokuMenuControlsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 6px;
  width: 100%;
  margin-top: ${THEME.spacer.x3}px;
`;

interface SudokuMenuControlsStateProps {
  notesMode: boolean;
  activeCell: Cell;
}

interface SudokuMenuControlsDispatchProps {
  clearCell: typeof clearCell;
  activateNotesMode: typeof activateNotesMode;
  deactivateNotesMode: typeof deactivateNotesMode;
  activateSettings: typeof activateSettings;
  getHint: typeof getHint;
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
          <ControlsButton onClick={() => this.props.getHint(this.props.activeCell)}>{"Hint"}</ControlsButton>
        </ControlContainer>
        {/* <ControlContainer>
          <ControlsButton onClick={this.props.activateSettings}>{"Settings"}</ControlsButton>
        </ControlContainer> */}
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
    activateSettings,
    getHint,
  },
)(SudokuMenuControls);

export default ConnectedSudokuMenuControls;
