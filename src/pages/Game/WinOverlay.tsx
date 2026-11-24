import * as React from "react";
import {Link} from "@tanstack/react-router";
import {useTranslation} from "react-i18next";
import Button from "src/components/Button";
import {GameState} from "src/context/GameContext";
import {stringifySudoku} from "src/lib/engine/utility";
import {getSudokusPaginated, resolveCollectionDisplayName, useSudokuCollections} from "src/lib/game/sudokus";
import {formatDuration} from "src/utils/format";
import {createGameSearchParams} from "src/utils/gameUrl";

const NextSudokuButton = ({gameState, onAdvance}: {gameState: GameState; onAdvance: () => void}) => {
  const {t} = useTranslation();
  const {getCollection} = useSudokuCollections();

  const collection = React.useMemo(() => {
    try {
      return getCollection(gameState.sudokuCollectionName);
    } catch (error) {
      console.error("Error loading sudoku collection:", error);
      return null;
    }
  }, [gameState.sudokuCollectionName, getCollection]);

  const collectionName = resolveCollectionDisplayName(gameState.sudokuCollectionName, getCollection, t);

  const nextSudokuParams = React.useMemo(() => {
    if (!collection) {
      return null;
    }

    try {
      const nextIndex = gameState.sudokuIndex + 1;
      const result = getSudokusPaginated(collection, nextIndex, 1);
      const sudoku = result.sudokus[0];

      if (sudoku) {
        return createGameSearchParams(stringifySudoku(sudoku.sudoku), nextIndex, gameState.sudokuCollectionName);
      }
    } catch (error) {
      console.error("Error calculating next sudoku:", error);
    }
    return null;
  }, [gameState.sudokuIndex, gameState.sudokuCollectionName, collection]);

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
    <div className="absolute bottom-0 left-0 right-0 top-0 z-30 flex items-center justify-center rounded-sm bg-overlay/85 text-ink backdrop-blur-[2px]">
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
