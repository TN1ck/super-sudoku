import * as React from "react";
import LazyLoad from "react-lazyload";

import SUDOKUS, {SudokuRaw} from "src/sudoku-game/sudokus";
import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";
import {DIFFICULTY} from "src/engine/types";
import styled from "styled-components";
import SudokuPreview from "./SudokuPreview/SudokuPreview";
import {setDifficulty} from "src/state/choose";
import {newGame, setGameState, continueGame, GameStateMachine} from "src/state/game";
import {setSudoku, setSudokuState} from "src/state/sudoku";
import THEME from "src/theme";
import {getState} from "src/sudoku-game/persistence";
import {playGame} from "src/state/application";

const TabBar = styled.div`
  display: flex;
  border-bottom: none;
  color: white;
  justify-content: center;
  padding-bottom: ${THEME.spacer.x2}px;
`;

const TabItem = styled.button<{
  active: boolean;
}>`
  padding: ${THEME.spacer.x2}px ${THEME.spacer.x2}px;
  font-size: ${THEME.fontSize.base}px;
  background: ${(p) => (p.active ? THEME.colors.foreground : THEME.colors.background)};
  color: ${(p) => (p.active ? THEME.colors.background : THEME.colors.foreground)};
  cursor: pointer;
  text-transform: capitalize;
  border: none;
  border-bottom-left-radius: ${THEME.borderRadius}px;
  border-bottom-right-radius: ${THEME.borderRadius}px;
`;

const SudokusContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  height: calc(100vh - ${THEME.spacer.x3 * 2 + 60}px);
  width: 100%;
  overflow: scroll;
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

const GameSelectContainer = styled.div`
  padding: ${THEME.spacer.x2}px 0;
  max-height: 100%;
  height: 100%;
`;

const SudokuPreviewPlaceholder: React.StatelessComponent<{size: number}> = ({size}) => (
  <SudokuContainer>
    <div style={{height: size, width: size, background: "grey"}} />
  </SudokuContainer>
);

interface GameIndexProps {
  difficulty: DIFFICULTY;
  chooseSudoku: (sudoku: SudokuRaw, index: number) => void;
}

class GameIndex extends React.Component<GameIndexProps, {elementWidth: number}> {
  dom: HTMLDivElement | null = null;
  constructor(props: GameIndexProps) {
    super(props);
    this.state = {
      elementWidth: -1,
    };
  }
  componentDidMount() {
    this.calcWidth();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.calcWidth);
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.calcWidth);
  }
  calcWidth = () => {
    if (this.dom === null) {
      return;
    }
    const width = this.dom.getBoundingClientRect().width;
    const MIN_SIZE = 150;
    const MAX_SIZE = 260;
    const MAX_COLUMNS = 4;

    let numberOfItems = 1;
    let elementWidth = Infinity;
    while (true) {
      const numberOfItemsNew = numberOfItems + 1;
      const elementWidthNew = Math.floor((width - numberOfItemsNew * 20) / numberOfItemsNew);
      if (elementWidthNew < MIN_SIZE || numberOfItemsNew > MAX_COLUMNS) {
        break;
      }
      numberOfItems = numberOfItemsNew;
      elementWidth = elementWidthNew;
    }
    this.setState({
      elementWidth: Math.min(MAX_SIZE, elementWidth),
    });
  };
  setRef = (dom: HTMLDivElement) => {
    this.dom = dom;
  };
  render() {
    const {elementWidth} = this.state;
    const {difficulty, chooseSudoku} = this.props;
    const sudokus = SUDOKUS[difficulty];

    const size = elementWidth;
    const localState = getState();

    return (
      <SudokusContainer ref={this.setRef} id="lazyload-container">
        {this.state.elementWidth !== -1
          ? sudokus.map((sudoku, i) => {
              const local = localState.sudokus[sudoku.id];
              const unfinished = local && local.game.state === GameStateMachine.paused;
              const finished = local && local.game.state === GameStateMachine.wonGame;
              const choose = () => {
                chooseSudoku(sudoku, i);
              };
              return (
                <LazyLoad
                  resize
                  scrollContainer="#lazyload-container"
                  height={size}
                  key={`${size}-${sudoku.id}}`}
                  placeholder={<SudokuPreviewPlaceholder size={size} />}
                >
                  <SudokuContainer>
                    {unfinished ? <SudokuPreviewButton>{"Continue"}</SudokuPreviewButton> : null}
                    {finished ? <SudokuPreviewButton>{"Finished. Restart?"}</SudokuPreviewButton> : null}
                    <SudokuPreview onClick={choose} size={size} id={i + 1} sudoku={sudoku.sudoku} darken />
                  </SudokuContainer>
                </LazyLoad>
              );
            })
          : null}
      </SudokusContainer>
    );
  }
}

interface GameSelectProps {
  difficulty: DIFFICULTY;
}

const connector = connect(
  (state: RootState) => {
    return {
      difficulty: state.choose.difficulty,
    };
  },
  {
    setDifficulty,
    newGame,
    continueGame,
    playGame,
    setSudoku,
    setSudokuState,
    setGameState,
  },
);

type PropsFromRedux = ConnectedProps<typeof connector>;

const GameSelect: React.StatelessComponent<GameSelectProps & PropsFromRedux> = ({
  difficulty,
  setDifficulty,
  newGame,
  setSudoku,
  setGameState,
  setSudokuState,
  continueGame,
  playGame,
}) => {
  const chooseSudoku = (sudoku: SudokuRaw, index: number) => {
    const localState = getState();
    const local = localState.sudokus[sudoku.id];
    playGame();
    if (!local || local.game.state === GameStateMachine.wonGame) {
      setSudoku(sudoku.sudoku, sudoku.solution);
      newGame(sudoku.id, index, difficulty);
      continueGame();
    } else {
      setGameState(local.game);
      setSudokuState(local.sudoku);
      continueGame();
    }
  };

  return (
    <GameSelectContainer>
      <TabBar>
        {[DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.EVIL].map((d, i) => {
          return (
            <TabItem
              tabIndex={i + 1}
              id={`tab-${d}`}
              key={d}
              active={d === difficulty}
              onClick={() => setDifficulty(d)}
            >
              {d}
            </TabItem>
          );
        })}
      </TabBar>
      <GameIndex difficulty={difficulty} chooseSudoku={chooseSudoku} />
    </GameSelectContainer>
  );
};

export default connector(GameSelect);
