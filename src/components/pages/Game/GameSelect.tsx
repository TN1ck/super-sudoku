import * as React from "react";

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
import {getState, StoredSudokuState} from "src/sudoku-game/persistence";
import {playGame} from "src/state/application";
import {formatDuration} from "src/utils/format";
import {useEffect} from "react";
import {RefObject} from "react";
import {useState} from "react";
import Button from "src/components/modules/Button";
import {useLocation, useNavigate} from "@tanstack/react-location";
import {stringifySudoku} from "src/engine/utility";

const TabItem = styled.button.attrs({
  className: "px-1 xs:px-2 sm:px-4 text-xs sm:text-sm md:text-base py-2 pointer capitalize rounded-sm border-none",
})<{
  active: boolean;
}>`
  background: ${(p) => (p.active ? THEME.colors.foreground : "transparent")};
  color: ${(p) => (p.active ? THEME.colors.background : THEME.colors.foreground)};
`;

export function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [elementWidth, setElementWidth] = useState<number>();

  useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      window.requestAnimationFrame(() => {
        setElementWidth(entry!.contentRect.width);
      });
    });

    const element = ref.current;

    if (element) {
      resizeObserver.observe(element);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return elementWidth;
}

// Nice page selector. Will show previous / next buttons, then the current page, the first and last page and the surrounding
// pages of the current. Will use ... to show the missing pages.
const PageSelector = ({
  page,
  pageCount,
  setPage,
}: {
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
}) => {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const current = page + 1; // Convert to 1-based for display

    // Always show first page
    pages.push(1);

    if (current > 4) {
      pages.push("...");
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(pageCount - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== pageCount) {
        pages.push(i);
      }
    }

    if (current < pageCount - 3) {
      pages.push("...");
    }

    // Always show last page
    if (pageCount > 1) {
      pages.push(pageCount);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 py-4">
      <Button onClick={() => setPage(page - 1)} disabled={page === 0}>
        {"‹"}
      </Button>

      {getVisiblePages().map((pageNum, index) => (
        <React.Fragment key={index}>
          {pageNum === "..." ? (
            <span className="px-2 text-gray-500">...</span>
          ) : (
            <Button
              onClick={() => setPage((pageNum as number) - 1)}
              className={pageNum === page + 1 ? "bg-teal-600 dark:bg-teal-600 text-white" : ""}
            >
              {pageNum}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button onClick={() => setPage(page + 1)} disabled={page === pageCount - 1}>
        {"›"}
      </Button>
    </div>
  );
};

const SudokuToSelect = ({
  sudoku,
  index,
  difficulty,
  chooseSudoku,
  storedSudoku,
}: {
  sudoku: SudokuRaw;
  storedSudoku: StoredSudokuState;
  index: number;
  difficulty: DIFFICULTY;
  chooseSudoku: (sudoku: SudokuRaw, index: number) => void;
}) => {
  const local = storedSudoku;
  const unfinished = local && local.game.state !== GameStateMachine.wonGame;
  const finished = local && local.game.state === GameStateMachine.wonGame;
  const navigate = useNavigate();

  const choose = () => {
    if (finished) {
      // TODO: make nice.
      const areYouSure = confirm("Are you sure? This will reset the sudoku.");
      if (!areYouSure) {
        return;
      }
    }
    navigate({
      to: "/",
      search: {
        sudokuId: sudoku.id,
        sudokuIndex: index,
        sudoku: stringifySudoku(sudoku.sudoku),
        difficulty: difficulty,
      },
    });

    chooseSudoku(sudoku, index);
  };

  const sudokuContainerRef = React.useRef(null);
  const size = useElementWidth(sudokuContainerRef);

  return (
    <div className="relative" ref={sudokuContainerRef}>
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
            <div>{`Solved ${local.game.timesSolved} ${local.game.timesSolved === 1 ? "time" : "times"}`}</div>
            {unfinished && <div>{"Continue"}</div>}
            {finished && <div>{`Restart?`}</div>}
          </div>
        </div>
      ) : null}
      <SudokuPreview
        size={size}
        onClick={choose}
        id={index + 1}
        sudoku={finished ? sudoku.solution : sudoku.sudoku}
        darken
      />
    </div>
  );
};

const GameIndex = ({
  chooseSudoku,
  pageSudokus,
  pageStart,
  difficulty,
}: {
  chooseSudoku: (sudoku: SudokuRaw, index: number) => void;
  pageSudokus: SudokuRaw[];
  pageStart: number;
  difficulty: DIFFICULTY;
}) => {
  const localState = getState();

  return (
    <div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {pageSudokus.map((sudoku, i) => {
          const index = i + pageStart;
          const local = localState.sudokus[sudoku.id];
          return (
            <SudokuToSelect
              difficulty={difficulty}
              sudoku={sudoku}
              index={index}
              chooseSudoku={chooseSudoku}
              storedSudoku={local}
            />
          );
        })}
      </div>
    </div>
  );
};

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
        setSudokuState({current: local.sudoku, history: [local.sudoku], historyIndex: 0});
      }
      continueGame();
    };

    const sudokus = SUDOKUS[difficulty];
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(50);
    const pageCount = Math.ceil(sudokus.length / pageSize);

    const pageStart = page * pageSize;
    const pageEnd = pageStart + pageSize;
    const pageSudokus = sudokus.slice(pageStart, pageEnd);

    return (
      <div className="relative h-full max-h-full mt-4">
        <div className="flex justify-between items-center">
          <div className="flex border-b-0 text-white justify-center">
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
          <PageSelector page={page} pageCount={pageCount} setPage={setPage} />
        </div>
        <GameIndex
          difficulty={difficulty}
          chooseSudoku={chooseSudoku}
          pageSudokus={pageSudokus}
          pageStart={pageStart}
        />
      </div>
    );
  },
);

export default connector(GameSelect);
