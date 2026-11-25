import * as React from "react";
import {Link} from "@tanstack/react-router";
import {useTranslation} from "react-i18next";
import Button from "src/components/Button";
import {GameState} from "src/context/GameContext";
import {parseSudoku, stringifySudoku} from "src/lib/engine/utility";
import {
  getCollectionPuzzleRawSync,
  loadCollectionPuzzleRaw,
  resolveCollectionDisplayName,
  useSudokuCollections,
} from "src/lib/game/sudokus";
import {formatDuration} from "src/utils/format";
import {createGameSearchParams} from "src/utils/gameUrl";

function toNextSudokuParams(raw: string | null, nextIndex: number, collectionName: string) {
  if (!raw) {
    return null;
  }
  try {
    const parsed = parseSudoku(raw);
    return createGameSearchParams(stringifySudoku(parsed), nextIndex, collectionName);
  } catch (error) {
    console.error("Error parsing next sudoku:", error);
    return null;
  }
}

const NextSudokuButton = ({gameState, onAdvance}: {gameState: GameState; onAdvance: () => void}) => {
  const {t} = useTranslation();
  const {getCollection} = useSudokuCollections();
  const nextIndex = gameState.sudokuIndex + 1;
  const requestKey = `${gameState.sudokuCollectionName}:${nextIndex}`;

  const collectionName = resolveCollectionDisplayName(gameState.sudokuCollectionName, getCollection, t);

  const syncRaw = React.useMemo(
    () => getCollectionPuzzleRawSync(gameState.sudokuCollectionName, nextIndex, getCollection),
    [gameState.sudokuCollectionName, nextIndex, getCollection],
  );

  const [asyncResult, setAsyncResult] = React.useState<{key: string; raw: string | null} | null>(null);

  React.useEffect(() => {
    if (syncRaw !== undefined) {
      return;
    }

    let cancelled = false;
    void loadCollectionPuzzleRaw(gameState.sudokuCollectionName, nextIndex, getCollection)
      .then((raw) => {
        if (!cancelled) {
          setAsyncResult({key: requestKey, raw});
        }
      })
      .catch((error) => {
        console.error("Error loading next sudoku:", error);
        if (!cancelled) {
          setAsyncResult({key: requestKey, raw: null});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gameState.sudokuCollectionName, nextIndex, getCollection, requestKey, syncRaw]);

  const isLoading = syncRaw === undefined && asyncResult?.key !== requestKey;
  const resolvedRaw = syncRaw !== undefined ? syncRaw : asyncResult?.key === requestKey ? asyncResult.raw : null;

  const nextSudokuParams = React.useMemo(
    () => (isLoading ? null : toNextSudokuParams(resolvedRaw, nextIndex, gameState.sudokuCollectionName)),
    [isLoading, resolvedRaw, nextIndex, gameState.sudokuCollectionName],
  );

  if (isLoading) {
    return <div className="h-10 w-full" aria-busy="true" />;
  }

  if (!nextSudokuParams) {
    return (
      <div>
        <p className="mb-4 max-w-64 text-center text-ink">{t("collection_finished", {collection: collectionName})}</p>
        <Link to="/select-game" className="w-full">
          <Button variant="accent" className="w-full">
            {t("select_new_sudoku")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Link
      to="/"
      search={nextSudokuParams}
      className="w-full"
      onClick={(event) => {
        if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          onAdvance();
        }
      }}
    >
      <Button variant="accent" className="w-full">
        {t("select_next_sudoku", {
          collection: collectionName,
          sudokuIndex: nextSudokuParams.sudokuIndex,
        })}
      </Button>
    </Link>
  );
};

export const WinOverlay = ({gameState, onAdvance}: {gameState: GameState; onAdvance: () => void}) => {
  const {t} = useTranslation();

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 z-30 flex items-center justify-center rounded-sm bg-overlay/85 text-ink backdrop-blur-[2px] print:hidden">
      <div className="grid gap-8">
        <div className="flex justify-center text-2xl">{t("congrats")}</div>
        <div className="text-md flex justify-center">
          <div className="grid">
            <div className="flex justify-center">
              {t(gameState.timesSolved === 1 ? "solved_time" : "solved_times", {count: gameState.timesSolved})}
            </div>
            <div className="flex justify-center">
              <div>
                {gameState.previousTimes.length > 0 && (
                  <div>{t("best_time", {time: formatDuration(Math.min(...gameState.previousTimes))})}</div>
                )}
                <div>{t("this_time", {time: formatDuration(gameState.secondsPlayed)})}</div>
              </div>
            </div>
          </div>
        </div>
        <NextSudokuButton gameState={gameState} onAdvance={onAdvance} />
      </div>
    </div>
  );
};
