import * as React from "react";

import SUDOKUS, {SudokuRaw} from "src/lib/game/sudokus";
import {DIFFICULTY} from "src/lib/engine/types";
import SudokuPreview from "../../components/sudoku/SudokuPreview";
import {useGame, GameStateMachine} from "src/context/GameContext";
import {useSudoku} from "src/context/SudokuContext";
import {getState, StoredSudokuState} from "src/lib/game/persistence";
import {formatDuration} from "src/utils/format";
import {useEffect} from "react";
import {RefObject} from "react";
import {useState} from "react";
import Button from "src/components/Button";
import {useLocation, useNavigate} from "@tanstack/react-location";
import {stringifySudoku} from "src/lib/engine/utility";
import {useElementWidth} from "src/utils/hooks";
import {useTimer} from "src/context/TimerContext";

const TabItem = ({active, children, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement> & {active: boolean}) => (
  <button
    className={`px-1 xs:px-2 sm:px-4 text-xs sm:text-sm md:text-base py-2 pointer capitalize rounded-sm border-none ${
      active ? "bg-white text-black dark:bg-gray-600 dark:text-white" : "bg-transparent text-white dark:text-gray-300"
    }`}
    {...props}
  >
    {children}
  </button>
);

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
  storedSudoku: StoredSudokuState | undefined;
  index: number;
  difficulty: DIFFICULTY;
  chooseSudoku: (sudoku: SudokuRaw, index: number, storedSudoku: StoredSudokuState | undefined) => void;
}) => {
  const localSudoku = storedSudoku;
  const unfinished = localSudoku && localSudoku.game.state !== GameStateMachine.wonGame;
  const finished = localSudoku && localSudoku.game.state === GameStateMachine.wonGame;
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
        sudokuIndex: index,
        sudoku: stringifySudoku(sudoku.sudoku),
        difficulty: difficulty,
      },
    });

    chooseSudoku(sudoku, index, localSudoku);
  };

  const sudokuContainerRef = React.useRef(null);
  const size = useElementWidth(sudokuContainerRef);

  return (
    <div className="relative" ref={sudokuContainerRef}>
      {unfinished || finished ? (
        <div className="pointer-events-none absolute left-2 rounded-sm bottom-2 z-10 max-w-min bg-gray-900 px-2 py-1 text-xs text-white md:text-base">
          <div>
            <div className="whitespace-nowrap">{`${
              unfinished ? "Play" : "Last"
            } time: ${formatDuration(localSudoku.game.secondsPlayed)}`}</div>
            {localSudoku.game.previousTimes.length > 0 && (
              <div className="whitespace-nowrap">{`Best time: ${formatDuration(
                Math.min(...localSudoku.game.previousTimes),
              )}`}</div>
            )}
            {localSudoku.game.timesSolved > 0 && (
              <div>{`Solved ${localSudoku.game.timesSolved} ${localSudoku.game.timesSolved === 1 ? "time" : "times"}`}</div>
            )}
            {unfinished && <div>{"Continue"}</div>}
            {finished && <div>{`Restart?`}</div>}
          </div>
        </div>
      ) : null}
      {size === undefined && (
        <div className="inline-block relative w-full">
          <div style={{marginTop: "100%"}} />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="w-full h-full bg-gray-300 dark:bg-gray-900 rounded-sm" />
          </div>
        </div>
      )}
      {size !== undefined && (
        <SudokuPreview
          size={size}
          onClick={choose}
          id={index + 1}
          sudoku={finished ? sudoku.solution : sudoku.sudoku}
          darken
        />
      )}
    </div>
  );
};

const GameIndex = ({
  chooseSudoku,
  pageSudokus,
  pageStart,
  difficulty,
}: {
  chooseSudoku: (sudoku: SudokuRaw, index: number, storedSudoku: StoredSudokuState | undefined) => void;
  pageSudokus: SudokuRaw[];
  pageStart: number;
  difficulty: DIFFICULTY;
}) => {
  const localState = getState();

  return (
    <div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {pageSudokus.map((sudoku, index) => {
          const globalIndex = pageStart + index;
          const sudokuKey = stringifySudoku(sudoku.sudoku);
          const storedSudoku = localState.sudokus[sudokuKey] as StoredSudokuState | undefined;
          return (
            <SudokuToSelect
              key={globalIndex}
              sudoku={sudoku}
              index={globalIndex}
              difficulty={difficulty}
              chooseSudoku={chooseSudoku}
              storedSudoku={storedSudoku}
            />
          );
        })}
      </div>
    </div>
  );
};

const GameSelect: React.FC = () => {
  const {newGame, continueGame, updateTimer, setGameState} = useGame();
  const {setSudoku, setSudokuState} = useSudoku();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<DIFFICULTY>(DIFFICULTY.EASY);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const search = (location as any).search;
    if (search?.sudokuIndex && search?.sudoku && search?.difficulty) {
      const sudoku = SUDOKUS[search.difficulty as DIFFICULTY]?.[search.sudokuIndex];
      if (sudoku && stringifySudoku(sudoku.sudoku) === search.sudoku) {
        newGame(search.sudokuIndex, search.difficulty);
        setSudoku(sudoku.sudoku, sudoku.solution);
        continueGame();
      }
    }
  }, [location, newGame, setSudoku, continueGame]);

  const chooseSudoku = (sudoku: SudokuRaw, index: number, storedSudoku: StoredSudokuState | undefined) => {
    newGame(index, activeTab);
    setSudoku(sudoku.sudoku, sudoku.solution);
    if (storedSudoku) {
      setGameState({
        ...storedSudoku.game,
      });
      setSudokuState({
        current: storedSudoku.sudoku,
        history: [storedSudoku.sudoku],
        historyIndex: 0,
      });
    }
    continueGame();
  };

  const sudokus = SUDOKUS[activeTab];
  const pageSize = 12;
  const pageCount = Math.ceil(sudokus.length / pageSize);
  const pageStart = page * pageSize;
  const pageSudokus = sudokus.slice(pageStart, pageStart + pageSize);

  const setActiveTabAndResetPage = (difficulty: DIFFICULTY) => {
    setActiveTab(difficulty);
    setPage(0);
  };

  return (
    <div className="mt-8">
      <div className="flex space-x-2 mb-8">
        {Object.values(DIFFICULTY).map((difficulty) => (
          <TabItem
            key={difficulty}
            active={activeTab === difficulty}
            onClick={() => setActiveTabAndResetPage(difficulty)}
          >
            {difficulty}
          </TabItem>
        ))}
      </div>
      <GameIndex chooseSudoku={chooseSudoku} pageSudokus={pageSudokus} pageStart={pageStart} difficulty={activeTab} />
      {pageCount > 1 && <PageSelector page={page} pageCount={pageCount} setPage={setPage} />}
    </div>
  );
};

export default GameSelect;
