import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {CaretLeft, CaretRight} from "@phosphor-icons/react";

import {
  getBaseCollectionCount,
  getBaseCollectionPageSync,
  getCustomCollectionPage,
  isBaseCollectionId,
  isCustomCollection,
  loadBaseCollectionPage,
  PaginatedSudokuPreviews,
  SudokuPreviewItem,
  useSudokuCollections,
} from "src/lib/game/sudokus";
import {solve} from "src/lib/engine/solverAC3_bitmask";
import {SimpleSudoku} from "src/lib/engine/types";
import SudokuPreview from "src/components/sudoku/SudokuPreview";
import {formatDuration} from "src/utils/format";
import {createGameSearchParams} from "src/utils/gameUrl";
import {createNewGameState, useGame} from "src/context/GameContext";
import Button from "src/components/Button";
import {cellsToSimpleSudoku, simpleSudokuToCells} from "src/lib/engine/utility";
import {useNavigate} from "@tanstack/react-router";
import {localStoragePlayedSudokuRepository, StoredPlayedSudokuState} from "src/lib/database/playedSudokus";
import {CollectionIndex, translateCollectionName} from "src/lib/database/collections";
import NewSudoku from "./NewSudoku";
import {useSudoku} from "src/context/SudokuContext";
import {useTranslation} from "react-i18next";

const TabItem = ({active, children, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement> & {active: boolean}) => (
  <button
    type="button"
    className={`cursor-pointer rounded-sm border px-1 py-2 text-xs capitalize transition-colors xs:px-2 sm:px-4 sm:text-sm md:text-base ${
      active
        ? "border-border bg-button font-semibold text-button-text shadow-sm"
        : "border-transparent bg-transparent text-ink-muted hover:bg-surface-subtle hover:text-ink"
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
  <div className="flex items-center justify-center gap-2 py-4">
    <Button
      aria-label="Previous page"
      className="inline-flex h-9 min-w-9 items-center justify-center px-2 md:h-10 md:min-w-10"
      onClick={() => setPage(page - 1)}
      disabled={page === 0}
    >
      <CaretLeft className="h-4 w-4" aria-hidden="true" />
    </Button>

    {getVisiblePages(page, pageCount).map((pageNum, index) => (
      <React.Fragment key={pageNum === "..." ? `ellipsis-${index}` : pageNum}>
        {pageNum === "..." ? (
          <span className="inline-flex min-w-6 justify-center text-ink-muted">...</span>
        ) : (
          <Button
            aria-current={pageNum === page + 1 ? "page" : undefined}
            className="inline-flex h-9 min-w-9 items-center justify-center px-2 tabular-nums md:h-10 md:min-w-10"
            onClick={() => setPage(pageNum - 1)}
            variant={pageNum === page + 1 ? "accent" : "default"}
          >
            {pageNum}
          </Button>
        )}
      </React.Fragment>
    ))}

    <Button
      aria-label="Next page"
      className="inline-flex h-9 min-w-9 items-center justify-center px-2 md:h-10 md:min-w-10"
      onClick={() => setPage(page + 1)}
      disabled={page >= pageCount - 1}
    >
      <CaretRight className="h-4 w-4" aria-hidden="true" />
    </Button>
  </div>
);

const SudokuToSelect = ({
  item,
  index,
  sudokuCollectionName,
  storedSudoku,
}: {
  item: SudokuPreviewItem;
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

  const previewSudoku = useMemo(() => {
    if (!finished) {
      return item.sudoku;
    }
    if (storedSudoku && storedSudoku.sudoku.length === 81) {
      return cellsToSimpleSudoku(storedSudoku.sudoku);
    }
    return solve(item.sudoku).sudoku ?? item.sudoku;
  }, [finished, storedSudoku, item.sudoku]);

  const choose = () => {
    if (finished && storedSudoku) {
      const areYouSure = confirm(t("confirm_restart_completed"));
      if (!areYouSure) {
        return;
      }
      const solution = solve(item.sudoku).sudoku ?? undefined;
      const replay = createNewGameState({...storedSudoku.game, sudokuCollectionName, sudokuIndex: index});
      setSudoku(simpleSudokuToCells(item.sudoku, solution));
      setGameState(replay);
    }
    void navigate({
      to: "/",
      search: createGameSearchParams(item.raw, index, sudokuCollectionName),
    });
  };

  return (
    <div className="relative">
      {storedSudoku && (unfinished || finished) ? (
        <div className="pointer-events-none absolute bottom-2 left-2 z-30 max-w-min rounded-sm border border-border bg-surface px-2 py-1 text-xs text-ink shadow-md md:text-base">
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
      <SudokuPreview onClick={choose} id={index + 1} sudoku={previewSudoku} darken />
    </div>
  );
};

const GameIndex = ({
  pageSudokus,
  pageStart,
  pageCount,
  isLoading,
  sudokuCollectionName,
}: {
  pageSudokus: SudokuPreviewItem[];
  pageStart: number;
  pageCount: number;
  isLoading: boolean;
  sudokuCollectionName: string;
}) => {
  const {t} = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4" aria-busy="true">
        {Array.from({length: PAGE_SIZE}, (_, i) => (
          <div
            key={`loading-${i}`}
            className="aspect-square w-full animate-pulse rounded-sm border border-border/40 bg-surface-subtle"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (pageSudokus.length === 0) {
    return <div className="text-center text-ink-muted">{t("no_sudokus_in_collection")}</div>;
  }

  const spacerCount = pageCount > 1 ? Math.max(0, PAGE_SIZE - pageSudokus.length) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {pageSudokus.map((item, index) => {
        const globalIndex = pageStart + index;
        const storedSudoku = localStoragePlayedSudokuRepository.getSudokuState(item.raw);

        return (
          <SudokuToSelect
            key={`${sudokuCollectionName}-${globalIndex}-${item.raw}`}
            item={item}
            index={globalIndex}
            sudokuCollectionName={sudokuCollectionName}
            storedSudoku={storedSudoku}
          />
        );
      })}
      {Array.from({length: spacerCount}, (_, i) => (
        <div key={`spacer-${i}`} className="aspect-square w-full" aria-hidden="true" />
      ))}
    </div>
  );
};

interface AsyncPageState {
  key: string;
  data: PaginatedSudokuPreviews;
}

const usePaginatedSudokus = (collection: CollectionIndex, page: number, pageSize: number) => {
  const customRaw = isCustomCollection(collection) ? collection.sudokusRaw : null;
  const baseCollectionId = isBaseCollectionId(collection.id) ? collection.id : null;
  const requestKey = `${collection.id}:${page}:${pageSize}`;

  const syncPage = useMemo((): PaginatedSudokuPreviews | null => {
    if (baseCollectionId) {
      return getBaseCollectionPageSync(baseCollectionId, page, pageSize);
    }
    if (customRaw !== null) {
      return getCustomCollectionPage({id: collection.id, name: collection.name, sudokusRaw: customRaw}, page, pageSize);
    }
    return {sudokus: [], totalRows: 0, page, pageSize, totalPages: 0};
  }, [baseCollectionId, collection.id, collection.name, customRaw, page, pageSize]);

  const [asyncState, setAsyncState] = useState<AsyncPageState | null>(null);

  useEffect(() => {
    if (!baseCollectionId || syncPage !== null) {
      return;
    }

    let cancelled = false;
    void loadBaseCollectionPage(baseCollectionId, page, pageSize)
      .then((data) => {
        if (!cancelled) {
          setAsyncState({key: requestKey, data});
        }
      })
      .catch((error) => {
        console.error("Failed to load sudoku collection chunk", baseCollectionId, page, error);
      });

    return () => {
      cancelled = true;
    };
  }, [baseCollectionId, page, pageSize, requestKey, syncPage]);

  if (syncPage !== null) {
    return {...syncPage, isLoading: false};
  }

  if (asyncState && asyncState.key === requestKey) {
    return {...asyncState.data, isLoading: false};
  }

  const totalRows = baseCollectionId ? getBaseCollectionCount(baseCollectionId) : 0;
  return {
    sudokus: [] as SudokuPreviewItem[],
    totalRows,
    page,
    pageSize,
    totalPages: Math.ceil(totalRows / pageSize),
    isLoading: true,
  };
};

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

  const {
    sudokus: pageSudokus,
    totalPages: pageCount,
    isLoading,
  } = usePaginatedSudokus(activeCollection, page, PAGE_SIZE);
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
      <div className="mb-8 flex items-center justify-between">
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
        <div className="mb-4 flex items-center justify-between gap-2">
          {!showNewSudokuComponent ? (
            <Button variant="accent" onClick={() => setShowNewSudokuComponent(true)}>
              {t("add_sudoku")}
            </Button>
          ) : (
            <Button onClick={() => setShowNewSudokuComponent(false)}>{t("close_new_sudoku_creator")}</Button>
          )}
          <Button onClick={removeCollectionLocal}>{t("delete_collection")}</Button>
        </div>
      )}
      {!isBaseCollectionLocal && showNewSudokuComponent && (
        <div className="mb-4 flex flex-col gap-4 rounded-sm border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-ink sm:text-2xl">{t("create_new_sudoku")}</div>
            <Button onClick={() => setShowNewSudokuComponent(false)}>{t("close")}</Button>
          </div>
          <p className="text-ink-muted">{t("add_your_own_sudoku", {collection: activeCollection.name})}</p>
          <NewSudoku saveSudoku={saveSudoku} />
        </div>
      )}
      <GameIndex
        pageSudokus={pageSudokus}
        pageStart={pageStart}
        pageCount={pageCount}
        isLoading={isLoading}
        sudokuCollectionName={activeCollection.id}
      />
      {pageCount > 1 && <PageSelector page={page} pageCount={pageCount} setPage={setPage} />}
    </div>
  );
};

export default GameSelect;
