import * as React from 'react';
import {Cell} from 'src/ducks/sudoku/model';

import * as _ from 'lodash';

import MenuComponent from './SudokuMenu';
import { CellContainer, CellInner, CellNumber, CellNoteContainer, CellNote } from 'src/components/modules/Sudoku/modules';

//
// Cell
//

class CellComponentBasic extends React.Component<
  {
    cell: Cell;
    showMenu: (cell) => any;
  },
  {
    notesMode: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      notesMode: false,
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.enterNotesMode = this.enterNotesMode.bind(this);
    this.exitNotesMode = this.exitNotesMode.bind(this);
  }
  shouldComponentUpdate(props, state) {
    return props.cell !== this.props.cell || this.state !== state;
  }
  enterNotesMode() {
    this.setState({
      notesMode: true,
    });
  }
  exitNotesMode() {
    this.setState({
      notesMode: false,
    });
  }
  toggleMenu() {
    if (!this.props.cell.initial) {
      this.props.showMenu(this.props.cell);
      this.exitNotesMode();
    }
  }
  render() {
    const cell = this.props.cell;
    const notes = [...cell.notes.values()];
    return (
      <CellContainer
        initial={cell.initial}
        onClick={this.toggleMenu}
      >
        <CellInner active={cell.showMenu}>
          <CellNumber>
            {this.props.cell.number}
          </CellNumber>
          <CellNoteContainer>
            {notes.sort().map(n => {
              return (
                <CellNote>
                  {n}
                </CellNote>
              );
            })}
          </CellNoteContainer>
        </CellInner>
        {this.props.cell.showMenu
          ? <MenuComponent
              enterNotesMode={this.enterNotesMode}
              exitNotesMode={this.exitNotesMode}
              notesMode={this.state.notesMode}
              cell={this.props.cell}
            />
          : null}
      </CellContainer>
    );
  }
}

export default CellComponentBasic;
