import * as React from "react";
import LazyLoad from "react-lazyload";

import SUDOKUS, {SudokuRaw} from "src/sudoku-game/sudokus";
import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";
import {DIFFICULTY} from "src/engine/types";
import styled from "styled-components";
import SudokuPreview from "./SudokuPreview/SudokuPreview";
import {setDifficulty} from "src/state/choose";
import {newGame, setGameState, continueGame, GameStateMachine, restartGame} from "src/state/game";
import {setSudoku, setSudokuState} from "src/state/sudoku";
import THEME from "src/theme";
import {getState} from "src/sudoku-game/persistence";
import {playGame} from "src/state/application";
import {formatDuration} from "src/utils/format";

const TabItem = styled.button.attrs({
  className: "px-1 xs:px-2 sm:px-4 text-xs sm:text-sm md:text-base py-2 pointer capitalize rounded-sm border-none",
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

const SudokuPreviewPlaceholder = React.memo(({size}: {size: number}) => (
  <SudokuContainer>
    <div style={{height: size, width: size, background: "grey"}} />
  </SudokuContainer>
));

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
    const MIN_SIZE = 190;
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
              const unfinished = local && local.game.state !== GameStateMachine.wonGame;
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
                    {unfinished || finished ? (
                      <div className="pointer-events-none absolute left-4 bottom-4 z-10 max-w-min bg-gray-900 px-4 py-2 text-sm text-white md:text-base">
                        <div>
                          <div className="whitespace-nowrap">{`${
                            unfinished ? "Current" : "Last"
                          } time: ${formatDuration(local.game.secondsPlayed)}.`}</div>
                          {local.game.previousTimes.length > 0 && (
                            <div className="whitespace-nowrap">{`Best time: ${formatDuration(
                              Math.min(...local.game.previousTimes),
                            )}.`}</div>
                          )}
                          <div>{`Solved ${local.game.timesSolved} ${
                            local.game.timesSolved === 1 ? "time" : "times"
                          }`}</div>
                          {unfinished && <div>{"Continue"}</div>}
                          {finished && <div>{`Restart?`}</div>}
                        </div>
                      </div>
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
      currentSudokuIndex: state.game.sudokuIndex,
      difficulty: state.choose.difficulty,
    };
  },
  {
    setDifficulty,
    newGame,
    restartGame,
    continueGame,
    playGame,
    setSudoku,
    setSudokuState,
    setGameState,
  },
);

type PropsFromRedux = ConnectedProps<typeof connector>;

const GameSelect = React.memo(
  ({
    currentSudokuIndex,
    difficulty,
    setDifficulty,
    newGame,
    restartGame,
    setSudoku,
    setGameState,
    setSudokuState,
    continueGame,
    playGame,
  }: GameSelectProps & PropsFromRedux) => {
    const chooseSudoku = (sudoku: SudokuRaw, index: number) => {
      const localState = getState();
      const local = localState.sudokus[sudoku.id];
      playGame();
      if (!local) {
        newGame(sudoku.id, index, difficulty);
        setSudoku(sudoku.sudoku, sudoku.solution);
      } else if (local.game.state === GameStateMachine.wonGame) {
        restartGame(
          sudoku.id,
          index,
          difficulty,
          local.game.timesSolved,
          local.game.secondsPlayed,
          local.game.previousTimes,
        );
        setSudoku(sudoku.sudoku, sudoku.solution);
      } else {
        setGameState(local.game);
        setSudokuState({current: local.sudoku, history: [], historyIndex: 0});
      }
      continueGame();
    };

    return (
      <div className="relative h-full max-h-full">
        {/* TODO: make this nicer */}
        <button
          onClick={() => {
            // TODO: Remove duplication with
            if (currentSudokuIndex === -1) {
              alert("You cannot close. You have to select a sudoku first!");
              return;
            }
            playGame();
            continueGame();
          }}
          className="absolute top-2 right-2 rounded-sm bg-transparent py-2 px-2 font-bold text-white hover:bg-white hover:bg-opacity-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <line
              x1="200"
              y1="56"
              x2="56"
              y2="200"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            ></line>
            <line
              x1="200"
              y1="200"
              x2="56"
              y2="56"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            ></line>
          </svg>
        </button>
        <div className="justify-left flex border-b-0 bg-gray-900 py-4 px-4 text-white sm:justify-center">
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
        </div>
        <GameIndex difficulty={difficulty} chooseSudoku={chooseSudoku} />
      </div>
    );
  },
);

export default connector(GameSelect);
