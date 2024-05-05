import * as React from "react";
import hotkeys from "hotkeys-js";
import {DIFFICULTY} from "src/engine/types";
import {setSudoku} from "src/state/sudoku";
import {nextSudoku, previousSudoku} from "src/state/choose";
import {continueGame} from "src/state/game";
import {RootState} from "src/state/rootReducer";
import {connect, MapStateToPropsParam} from "react-redux";

import SUDOKUS from "src/sudoku-game/sudokus";
import {ShortcutScope} from "./ShortcutScope";

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
    hotkeys("up", ShortcutScope.SelectSudoku, () => {
      return false;
    });
    hotkeys("down", ShortcutScope.SelectSudoku, () => {
      return false;
    });
    hotkeys("left", ShortcutScope.SelectSudoku, () => {
      this.props.previousSudoku();
      return false;
    });
    hotkeys("right", ShortcutScope.SelectSudoku, () => {
      this.props.nextSudoku();
      return false;
    });
    hotkeys("enter", ShortcutScope.SelectSudoku, () => {
      const sudoku = SUDOKUS[this.props.difficulty][this.props.sudokuIndex];
      this.props.setSudoku(sudoku.sudoku, sudoku.solution);
      this.props.continueGame();
    });
  }
  componentWillUnmount() {
    hotkeys.deleteScope(ShortcutScope.SelectSudoku);
  }
  render() {
    return null;
  }
}

export default connect<GameSelectShortcutsStateProps, GameSelectShortcutsDispatchProps, {}, RootState>(
  (state: RootState) => ({
    sudokuIndex: state.choose.sudokuIndex,
    difficulty: state.choose.difficulty,
  }),
  {previousSudoku, nextSudoku, setSudoku, continueGame},
)(GameSelectShortcuts);
