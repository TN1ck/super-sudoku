import * as React from "react";
import key from "keymaster";
import {DIFFICULTY} from "src/engine/utility";
import {setSudoku} from "src/ducks/sudoku";
import {nextSudoku, previousSudoku} from "src/ducks/game/choose";
import {continueGame} from "src/ducks/game";
import {RootState} from "src/ducks";
import {connect} from "react-redux";

import SUDOKUS from "src/assets/sudokus-new";
import {ShortcutScope} from "./scopes";

interface GameSelectShortcutsDispatchProps {
  setSudoku: typeof setSudoku;
  nextSudoku: typeof nextSudoku;
  previousSudoku: typeof previousSudoku;
  continueGame: typeof continueGame;
}

interface GameSelectShortcutsStateProps {
  sudokuIndex: number;
  difficulty: DIFFICULTY;
}

class GameSelectShortcuts extends React.Component<GameSelectShortcutsDispatchProps & GameSelectShortcutsStateProps> {
  componentWillMount() {
    key("up", ShortcutScope.SelectSudoku, () => {
      console.log("up");
      return false;
    });
    key("down", ShortcutScope.SelectSudoku, () => {
      console.log("down");
      return false;
    });
    key("left", ShortcutScope.SelectSudoku, () => {
      this.props.previousSudoku();
      return false;
    });
    key("right", ShortcutScope.SelectSudoku, () => {
      this.props.nextSudoku();
      return false;
    });
    key("enter", ShortcutScope.SelectSudoku, () => {
      const sudoku = SUDOKUS[this.props.difficulty][this.props.sudokuIndex];
      this.props.setSudoku(this.props.difficulty, sudoku.sudoku, sudoku.solution);
      this.props.continueGame();
    });
  }
  componentWillUnmount() {
    key.deleteScope(ShortcutScope.SelectSudoku);
  }
  render() {
    return null;
  }
}

export default connect<GameSelectShortcutsStateProps, GameSelectShortcutsDispatchProps>(
  (state: RootState) => ({
    sudokuIndex: state.choose.sudokuIndex,
    difficulty: state.choose.difficulty,
  }),
  {previousSudoku, nextSudoku, setSudoku, continueGame},
)(GameSelectShortcuts);
