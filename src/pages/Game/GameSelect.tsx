import * as React from "react";
import {useMemo, useState} from "react";

import {getSudokusPaginated, SudokuRaw, useSudokuCollections} from "src/lib/game/sudokus";
import {SimpleSudoku} from "src/lib/engine/types";
import SudokuPreview from "src/components/sudoku/SudokuPreview";
import {formatDuration} from "src/utils/format";
import {createGameSearchParams} from "src/utils/gameUrl";
import {createNewGameState, useGame} from "src/context/GameContext";
import Button from "src/components/Button";
import {simpleSudokuToCells, stringifySudoku} from "src/lib/engine/utility";
import {useElementWidth} from "src/utils/hooks";
import {useNavigate} from "@tanstack/react-router";
import {localStoragePlayedSudokuRepository, StoredPlayedSudokuState} from "src/lib/database/playedSudokus";
import {Collection, translateCollectionName} from "src/lib/database/collections";
import NewSudoku from "./NewSudoku";
import {useSudoku} from "src/context/SudokuContext";
import {useTranslation} from "react-i18next";

const TabItem = ({active, children, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement> & {active: boolean}) => (
  <button
    type="button"
    className={`px-1 xs:px-2 sm:px-4 text-xs sm:text-sm md:text-base py-2 cursor-pointer capitalize rounded-sm border-none hover:bg-gray-500 ${
      active ? "bg-white text-black dark:bg-gray-600 dark:text-white" : "bg-transparent text-white dark:text-gray-300"
    }`}
    {...props}
  >
    {children}
  </button>
);

export function getVisiblePages(page: number, pageCount: number): Array<number | "..."> {
  if (pageCount <= 0) {
    return [];
  }
  const current = page + 1;
  const pages: Array<number | "..."> = [1];

  const start = Math.max(2, current - 1);
  const end = Math.min(pageCount - 1, current + 1);

  if (start > 2) {
    pages.push(start === 3 ? 2 : "...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < pageCount - 1) {
    pages.push(end === pageCount - 2 ? pageCount - 1 : "...");
  }

  if (pageCount > 1) {
    pages.push(pageCount);
  }

  return pages;
}

const PageSelector = ({
  page,
  pageCount,
  setPage,
}: {
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
}) => (
  <div className="flex justify-center items-center space-x-2 py-4">
    <Button aria-label="Previous page" onClick={() => setPage(page - 1)} disabled={page === 0}>
      {"‹"}
    </Button>

    {getVisiblePages(page, pageCount).map((pageNum, index) => (
      <React.Fragment key={pageNum === "..." ? `ellipsis-${index}` : pageNum}>
        {pageNum === "..." ? (
          <span className="px-2 text-gray-500">...</span>
        ) : (
          <Button
            aria-current={pageNum === page + 1 ? "page" : undefined}
            onClick={() => setPage(pageNum - 1)}
            className={pageNum === page + 1 ? "bg-teal-600 dark:bg-teal-600 text-white" : ""}
          >
            {pageNum}
          </Button>
        )}
      </React.Fragment>
    ))}

    <Button aria-label="Next page" onClick={() => setPage(page + 1)} disabled={page >= pageCount - 1}>
      {"›"}
    </Button>
  </div>
);

const SudokuToSelect = ({
  sudoku,
  index,
  sudokuCollectionName,
  storedSudoku,
}: {
  sudoku: SudokuRaw;
  storedSudoku: StoredPlayedSudokuState | undefined;
  index: number;
  sudokuCollectionName: string;
}) => {
  const {setGameState} = useGame();
  const {setSudoku} = useSudoku();
  const unfinished = Boolean(storedSudoku && !storedSudoku.game.won);
  const finished = Boolean(storedSudoku && storedSudoku.game.won);
  const navigate = useNavigate();
  const {t} = useTranslation();

  const choose = () => {
    if (finished && storedSudoku) {
      const areYouSure = confirm(t("confirm_restart_completed"));
      if (!areYouSure) {
        return;
      }
      const replay = createNewGameState({...storedSudoku.game, sudokuCollectionName, sudokuIndex: index});
      setSudoku(simpleSudokuToCells(sudoku.sudoku, sudoku.solution));
      setGameState(replay);
    }
    navigate({
      to: "/",
      search: createGameSearchParams(stringifySudoku(sudoku.sudoku), index, sudokuCollectionName),
    });
  };

  const sudokuContainerRef = React.useRef<HTMLDivElement | null>(null);
  const size = useElementWidth(sudokuContainerRef);

  return (
    <div className="relative" ref={sudokuContainerRef}>
      {storedSudoku && (unfinished || finished) ? (
        <div className="pointer-events-none absolute left-2 rounded-sm bottom-2 z-10 max-w-min bg-gray-900 px-2 py-1 text-xs text-white md:text-base">
          <div>
            <div className="whitespace-nowrap">{`${unfinished ? t("play_time") : t("last_time")} ${formatDuration(
              storedSudoku.game.secondsPlayed,
            )}`}</div>
            {storedSudoku.game.previousTimes.length > 0 && (
              <div className="whitespace-nowrap">
                {t("best_time", {time: formatDuration(Math.min(...storedSudoku.game.previousTimes))})}
              </div>
            )}
            {storedSudoku.game.timesSolved > 0 && (
              <div>
                {t(storedSudoku.game.timesSolved === 1 ? "solved_count_one" : "solved_count_other", {
                  count: storedSudoku.game.timesSolved,
                })}
              </div>
            )}
            {unfinished && <div>{t("continue")}</div>}
            {finished && <div>{t("restart?")}</div>}
          </div>
        </div>
      ) : null}
      {size === undefined ? (
        <div className="inline-block relative w-full">
          <div style={{marginTop: "100%"}} />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="w-full h-full bg-gray-300 dark:bg-gray-900 rounded-sm" />
          </div>
        </div>
      ) : (
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
  pageSudokus,
  pageStart,
  sudokuCollectionName,
}: {
  pageSudokus: SudokuRaw[];
  pageStart: number;
  sudokuCollectionName: string;
}) => {
  const {t} = useTranslation();

  if (pageSudokus.length === 0) {
    return <div className="text-center text-white">{t("no_sudokus_in_collection")}</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
      {pageSudokus.map((sudoku, index) => {
        const globalIndex = pageStart + index;
        const sudokuKey = stringifySudoku(sudoku.sudoku);
        const storedSudoku = localStoragePlayedSudokuRepository.getSudokuState(sudokuKey);

        return (
          <SudokuToSelect
            key={`${sudokuCollectionName}-${globalIndex}-${sudokuKey}`}
            sudoku={sudoku}
            index={globalIndex}
            sudokuCollectionName={sudokuCollectionName}
            storedSudoku={storedSudoku}
          />
        );
      })}
    </div>
  );
};

const usePaginatedSudokus = (collection: Collection, page: number, pageSize: number) =>
  useMemo(
    () => getSudokusPaginated(collection, page, pageSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collection.id, collection.name, collection.sudokusRaw, page, pageSize],
  );

const PAGE_SIZE = 12;

const GameSelect: React.FC = () => {
  const {
    activeCollection,
    setActiveCollectionId,
    collections,
    addCollection,
    isBaseCollection,
    addSudokuToCollection,
    removeCollection,
  } = useSudokuCollections();
  const [page, setPage] = useState(0);
  const [showNewSudokuComponent, setShowNewSudokuComponent] = useState(false);
  const {t} = useTranslation();

  const {sudokus: pageSudokus, totalPages: pageCount} = usePaginatedSudokus(activeCollection, page, PAGE_SIZE);
  const pageStart = page * PAGE_SIZE;
  const isBaseCollectionLocal = isBaseCollection(activeCollection.id);

  const setActiveCollectionAndResetPage = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setShowNewSudokuComponent(false);
    setPage(0);
  };

  const saveSudoku = async (sudoku: SimpleSudoku) => {
    const savedIndex = addSudokuToCollection(activeCollection.id, sudoku);
    setPage(Math.floor(savedIndex / PAGE_SIZE));
    setShowNewSudokuComponent(false);
  };

  const removeCollectionLocal = () => {
    if (isBaseCollectionLocal) {
      alert(t("cannot_delete_base_collection"));
      return;
    }
    const areYouSure = confirm(
      t("confirm_delete_collection", {collection: translateCollectionName(activeCollection.name)}),
    );
    if (!areYouSure) {
      return;
    }
    removeCollection(activeCollection.id);
    setActiveCollectionAndResetPage(collections[0].id);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-wrap gap-2">
          {collections.map((collection) => (
            <TabItem
              key={collection.id}
              active={activeCollection.id === collection.id}
              onClick={() => setActiveCollectionAndResetPage(collection.id)}
            >
              {translateCollectionName(collection.name)}
            </TabItem>
          ))}
          <TabItem
            active={false}
            onClick={() => {
              const newCollectionName = prompt(t("enter_new_collection_name"))?.trim();
              if (newCollectionName) {
                const newCollection = addCollection(newCollectionName);
                setActiveCollectionAndResetPage(newCollection.id);
              }
            }}
          >
            {t("add_new_collection")}
          </TabItem>
        </div>
      </div>
      {!isBaseCollectionLocal && (
        <div className="flex justify-between items-center gap-2 mb-4">
          {!showNewSudokuComponent ? (
            <Button className="bg-teal-600 dark:bg-teal-600 text-white" onClick={() => setShowNewSudokuComponent(true)}>
              {t("add_sudoku")}
            </Button>
          ) : (
            <Button onClick={() => setShowNewSudokuComponent(false)}>{t("close_new_sudoku_creator")}</Button>
          )}
          <Button onClick={removeCollectionLocal}>{t("delete_collection")}</Button>
        </div>
      )}
      {!isBaseCollectionLocal && showNewSudokuComponent && (
        <div className="mb-4 p-4 bg-gray-900 rounded-sm border border-gray-700 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="text-white text-lg sm:text-2xl font-bold">{t("create_new_sudoku")}</div>
            <Button onClick={() => setShowNewSudokuComponent(false)}>{t("close")}</Button>
          </div>
          <p className="text-white">{t("add_your_own_sudoku", {collection: activeCollection.name})}</p>
          <NewSudoku saveSudoku={saveSudoku} />
        </div>
      )}
      <GameIndex pageSudokus={pageSudokus} pageStart={pageStart} sudokuCollectionName={activeCollection.id} />
      {pageCount > 1 && <PageSelector page={page} pageCount={pageCount} setPage={setPage} />}
    </div>
  );
};

export default GameSelect;
