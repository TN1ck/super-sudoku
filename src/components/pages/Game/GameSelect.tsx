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
import {formatDuration} from "src/utils/format";

const TabBar = styled.div.attrs({
  className: "flex text-white py-4 justify-center border-b-0 bg-gray-900",
})``;

const TabItem = styled.button.attrs({
  className: "px-2 sm:px-4 text-sm sm:text-base py-2 pointer capitalize rounded-sm border-none",
})<{
  active: boolean;
}>`
  background: ${(p) => (p.active ? THEME.colors.foreground : "transparent")};
  color: ${(p) => (p.active ? THEME.colors.background : THEME.colors.foreground)};
`;

const SudokusContainer = styled.div.attrs({
  className: "flex flex-wrap justify-center relative w-full overflow-scroll pt-2",
})`
  height: calc(100% - 88px);
`;

const SudokuContainer = styled.div.attrs({
  className: "p-2 relative",
})``;

const SudokuPreviewButton = styled.div.attrs({
  className: "px-4 py-2 left-4 bottom-4 absolute",
})`
  background: ${THEME.colors.background};
  color: ${THEME.colors.foreground};
  z-index: 2;
`;

const GameSelectContainer = styled.div.attrs({
  className: "h-full max-h-full",
})``;

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
  _isMounted: boolean = false;
  constructor(props: GameIndexProps) {
    super(props);
    this.state = {
      elementWidth: -1,
    };
  }
  componentDidMount() {
    this._isMounted = true;
    setTimeout(() => {
      this.calcWidth();
    });
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.calcWidth);
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener("resize", this.calcWidth);
  }
  calcWidth = () => {
    const dom = document.getElementById("lazyload-container");
    if (dom === null || !this._isMounted) {
      return;
    }
    const width = dom.getBoundingClientRect().width - 16;
    const MIN_SIZE = 140;
    const MAX_SIZE = 300;
    const MAX_COLUMNS = 4;

    const calculate = (numberOfItems: number) => {
      return Math.floor((width - numberOfItems * 8 * 2) / numberOfItems);
    };

    let numberOfItems = 1;
    let elementWidth = calculate(numberOfItems);
    while (true) {
      const numberOfItemsNew = numberOfItems + 1;
      const elementWidthNew = calculate(numberOfItems);
      if (elementWidthNew < MIN_SIZE || numberOfItemsNew > MAX_COLUMNS) {
        break;
      }
      numberOfItems = numberOfItemsNew;
      elementWidth = elementWidthNew;
    }
    elementWidth = Math.min(width, Math.min(MAX_SIZE, elementWidth));
    this.setState({
      elementWidth,
    });
  };
  render() {
    const {elementWidth} = this.state;
    const {difficulty, chooseSudoku} = this.props;
    const sudokus = SUDOKUS[difficulty];

    const size = elementWidth;
    const localState = getState();

    return (
      <SudokusContainer id="lazyload-container">
        {this.state.elementWidth !== -1
          ? sudokus.map((sudoku, i) => {
              const local = localState.sudokus[sudoku.id];
              const unfinished = local && local.game.state === GameStateMachine.paused;
              const finished = local && local.game.state === GameStateMachine.wonGame;
              const choose = () => {
                if (finished) {
                  // TODO: make nice.
                  const areYouSure = confirm("Are you sure? This will reset the sudoku.");
                  if (!areYouSure) {
                    return;
                  }
                }
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
                    {finished ? (
                      <SudokuPreviewButton>{`Finished in ${formatDuration(
                        local.game.secondsPlayed,
                      )}. Restart?`}</SudokuPreviewButton>
                    ) : null}
                    <SudokuPreview
                      onClick={choose}
                      size={size}
                      id={i + 1}
                      sudoku={finished ? sudoku.solution : sudoku.sudoku}
                      darken
                    />
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
      newGame(sudoku.id, index, difficulty);
      setSudoku(sudoku.sudoku, sudoku.solution);
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
        {[DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.EXPERT, DIFFICULTY.EVIL].map((d, i) => {
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
