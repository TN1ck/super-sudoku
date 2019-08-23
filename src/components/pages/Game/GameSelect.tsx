import * as React from "react";
import LazyLoad from "react-lazyload";
import SUDOKUS, {SudokuRaw} from "src/sudoku-game/sudokus";
import {connect} from "react-redux";
import {RootState} from "src/state/rootReducer";
import {DIFFICULTY} from "src/engine/types";
import styled from "styled-components";
import SudokuPreview from "./SudokuPreview/SudokuPreview";
import {setDifficulty} from "src/state/choose";
import {newGame, setGameState, continueGame, GameStateMachine} from "src/state/game";
import {setSudoku, setSudokuState} from "src/state/sudoku";
import THEME from "src/theme";
import {getState} from "src/sudoku-game/persistence";

const TabBar = styled.div`
  display: flex;
  border-bottom: none;
  color: white;
  justify-content: center;
`;

const TabItem = styled.div<{
  active: boolean;
}>`
  padding: ${THEME.spacer.x2}px ${THEME.spacer.x2}px;
  background: ${p => (p.active ? THEME.colors.foreground : THEME.colors.background)};
  color: ${p => (p.active ? THEME.colors.background : THEME.colors.foreground)};
  cursor: pointer;
  text-transform: capitalize;
  border-bottom-left-radius: ${THEME.borderRadius}px;
  border-bottom-right-radius: ${THEME.borderRadius}px;
`;

const SudokusContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const SudokuContainer = styled.div`
  padding: ${THEME.spacer.x2}px;
  position: relative;
`;

const SudokuPreviewButton = styled.div`
  position: absolute;
  background: ${THEME.colors.background};
  color: ${THEME.colors.foreground};
  z-index: 2;
  padding: ${THEME.spacer.x1}px;
  left: ${THEME.spacer.x2 + THEME.spacer.x1}px;
  bottom: ${THEME.spacer.x2 + THEME.spacer.x1}px;
`;

const SudokuPreviewPlaceholder: React.StatelessComponent<{size: number}> = ({size}) => (
  <SudokuContainer>
    <div style={{height: size, width: size, background: "grey"}} />
  </SudokuContainer>
);

class GameIndex extends React.Component<{
  difficulty: DIFFICULTY;
  chooseSudoku: (sudoku, index) => void;
}> {
  constructor(props) {
    super(props);
  }
  render() {
    let {difficulty, chooseSudoku} = this.props;
    const sudokus = SUDOKUS[difficulty];

    const size = window.innerWidth < 500 ? 130 : 170;
    const localState = getState();

    return (
      <SudokusContainer>
        {sudokus.map((sudoku, i) => {
          const local = localState.sudokus[sudoku.id];
          const unfinished = local && local.game.state === GameStateMachine.paused;
          const finished = local && local.game.state === GameStateMachine.wonGame;
          const choose = () => {
            chooseSudoku(sudoku, i);
          };
          return (
            <LazyLoad height={size} key={sudoku.id} placeholder={<SudokuPreviewPlaceholder size={size} />}>
              <SudokuContainer>
                {unfinished ? <SudokuPreviewButton>{"Continue"}</SudokuPreviewButton> : null}
                {finished ? <SudokuPreviewButton>{"Finished. Restart?"}</SudokuPreviewButton> : null}
                <SudokuPreview onClick={choose} size={size} id={i + 1} sudoku={sudoku.sudoku} darken />
              </SudokuContainer>
            </LazyLoad>
          );
        })}
      </SudokusContainer>
    );
  }
}

interface GameSelectProps {
  difficulty: DIFFICULTY;
}

interface GameSelectDispatchProps {
  setDifficulty: typeof setDifficulty;
  setSudoku: typeof setSudoku;
  setSudokuState: typeof setSudokuState;
  setGameState: typeof setGameState;
  newGame: typeof newGame;
  continueGame: typeof continueGame;
}

const GameSelect: React.StatelessComponent<GameSelectProps & GameSelectDispatchProps> = ({
  difficulty,
  setDifficulty,
  newGame,
  setSudoku,
  setGameState,
  setSudokuState,
  continueGame,
}) => {
  const chooseSudoku = (sudoku: SudokuRaw, index: number) => {
    const localState = getState();
    const local = localState.sudokus[sudoku.id];
    // this does not work right now as we always have the
    // CHOOSE_GAME state.
    if (local && GameStateMachine.wonGame) {
      setSudoku(sudoku.sudoku, sudoku.solution);
      newGame(sudoku.id, index);
      continueGame();
    } else {
      setGameState(local.game);
      setSudokuState(local.sudoku);
      continueGame();
    }
  };

  return (
    <div>
      <TabBar>
        {[DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.EVIL].map(d => {
          return (
            <TabItem key={d} active={d === difficulty} onClick={() => setDifficulty(d)}>
              {d}
            </TabItem>
          );
        })}
      </TabBar>
      <GameIndex difficulty={difficulty} chooseSudoku={chooseSudoku} />
    </div>
  );
};

const GameSelectConnected = connect<GameSelectProps, GameSelectDispatchProps>(
  (state: RootState) => {
    return {
      difficulty: state.choose.difficulty,
    };
  },
  {
    setDifficulty,
    newGame,
    continueGame,
    setSudoku,
    setSudokuState,
    setGameState,
  },
)(GameSelect);

export default GameSelectConnected;
