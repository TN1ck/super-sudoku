import * as React from "react";

import {useGame, GameStateMachine, GameState, GameProvider} from "src/context/GameContext";
import {canUndo, createSudokuState, emptyGrid, SudokuProvider, SudokuState, useSudoku} from "src/context/SudokuContext";

import {Sudoku} from "src/components/sudoku/Sudoku";

import GameTimer from "./Game/GameTimer";

import Button from "src/components/Button";
import SudokuGame from "src/lib/game/SudokuGame";
import SudokuMenuNumbers from "src/components/sudoku/SudokuMenuNumbers";
import SudokuMenuControls from "src/components/sudoku/SudokuMenuControls";
import {Container} from "src/components/Layout";
import Shortcuts from "./Game/shortcuts/Shortcuts";
import Checkbox from "src/components/Checkbox";
import {cellsToSimpleSudoku, findCell, stringifySudoku, parseSudoku, simpleSudokuToCells} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3";
import {Link, useLocation, useNavigate} from "@tanstack/react-router";
import {getCurrentSudokuFromStorage, localStoragePlayedSudokuRepository} from "src/lib/database/playedSudokus";
import {formatDuration} from "src/utils/format";
import throttle from "lodash-es/throttle";
import {TimerProvider} from "src/context/TimerContext";
import {useEffect} from "react";
import {DarkModeButton} from "src/components/DarkModeButton";
import LanguageSelector from "src/components/LanguageSelector";
import {useTranslation} from "react-i18next";
import {UserPreferencesProvider, useUserPreferences} from "src/context/UserPrefencesContext";
import {getSudokusPaginated, useSudokuCollections} from "src/lib/game/sudokus";
import {t} from "i18next";
import {translateCollectionName} from "src/lib/database/collections";

function PauseButton({
  disabled,
  paused,
  pauseGame,
  continueGame,
}: {
  disabled: boolean;
  paused: boolean;
  pauseGame: () => void;
  continueGame: () => void;
}) {
  const {t} = useTranslation();
  return (
    <Button disabled={disabled} onClick={paused ? continueGame : pauseGame}>
      {paused ? t("continue") : t("pause")}
    </Button>
  );
}

const ClearGameButton: React.FC<{
  clearGame: () => void;
  pauseGame: () => void;
  continueGame: () => void;
  disabled: boolean;
}> = ({clearGame, pauseGame, continueGame, disabled}) => {
  const {t} = useTranslation();
  const clearGameLocal = async () => {
    pauseGame();
    // Wait 50ms to make sure the game is shown as paused when in the confirm dialog.
    await new Promise((resolve) => setTimeout(resolve, 30));
    const areYouSure = confirm(t("confirm_clear"));
    if (!areYouSure) {
      continueGame();
      return;
    }
    clearGame();
    // Wait 100ms as we have to wait until the updateTimer is called (should normally take 1/60 second)
    // This is certainly not ideal and should be fixed there.
    await new Promise((resolve) => setTimeout(resolve, 100));
    continueGame();
  };

  return (
    <Button disabled={disabled} onClick={clearGameLocal}>
      {t("clear")}
    </Button>
  );
};

const NewGameButton: React.FC = () => {
  const {pauseGame} = useGame();
  const navigate = useNavigate();
  const {t} = useTranslation();

  const pauseAndChoose = async () => {
    pauseGame();
    await navigate({
      to: "/select-game",
    });
  };

  return (
    <Button className="bg-teal-600 dark:bg-teal-600 text-white" onClick={pauseAndChoose}>
      {t("new_game")}
    </Button>
  );
};

const NextSudokuButton = ({gameState}: {gameState: GameState}) => {
  const {getCollection} = useSudokuCollections();
  const collection = React.useMemo(() => {
    try {
      return getCollection(gameState.sudokuCollectionName);
    } catch (error) {
      console.error("Error loading sudoku collection:", error);
      return null;
    }
  }, [gameState.sudokuCollectionName, getCollection]);
  const collectionName = collection
    ? translateCollectionName(collection.name)
    : translateCollectionName(gameState.sudokuCollectionName);

  // Pre-calculate next sudoku parameters
  const nextSudokuParams = React.useMemo(() => {
    if (!collection) {
      return null;
    }

    try {
      const nextIndex = gameState.sudokuIndex + 1;

      const result = getSudokusPaginated(collection, nextIndex, 1);
      const sudoku = result.sudokus[0];

      if (sudoku) {
        return {
          sudokuIndex: nextIndex + 1,
          sudoku: stringifySudoku(sudoku.sudoku),
          sudokuCollectionName: gameState.sudokuCollectionName,
        };
      }
    } catch (error) {
      console.error("Error calculating next sudoku:", error);
    }
    return null;
  }, [gameState.sudokuIndex, gameState.sudokuCollectionName, collection]);

  if (!nextSudokuParams) {
    return (
      <div>
        <p className="dark:text-white text-black mb-4 max-w-64 text-center">
          {t("collection_finished", {collection: collectionName})}
        </p>
        <Link to="/select-game" className="w-full">
          <Button className="bg-teal-700 text-white w-full">{t("select_new_sudoku")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <Link to="/" search={nextSudokuParams} className="w-full">
      <Button className="bg-teal-700 text-white w-full">
        {t("select_next_sudoku", {
          collection: collectionName,
          sudokuIndex: nextSudokuParams.sudokuIndex,
        })}
      </Button>
    </Link>
  );
};

const ShareButton: React.FC<{
  gameState: GameState;
  sudokuState: SudokuState;
}> = ({gameState, sudokuState}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Error copying to clipboard", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async () => {
    const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudokuState.current));
    const params = new URLSearchParams({
      sudokuIndex: String(gameState.sudokuIndex + 1),
      sudoku: stringifiedSudoku,
      sudokuCollectionName: gameState.sudokuCollectionName,
    });
    const shareUrl = `${window.location.origin}${window.location.pathname}#/?${params.toString()}`;

    await copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const {t} = useTranslation();

  return (
    <button
      aria-label={t("share")}
      className="text-white hover:cursor-pointer p-1 hover:bg-gray-500 rounded-md border-none bg-transparent"
      data-testid="share-sudoku"
      onClick={handleShare}
      type="button"
    >
      {copied ? t("copied") : `🔗 ${t("share")}`}
    </button>
  );
};

const CenteredContinueButton: React.FC<{visible: boolean; onClick: () => void}> = ({visible, onClick}) => (
  <div
    onClick={onClick}
    data-testid="continue-overlay"
    className={`${visible ? "flex" : "hidden"} justify-center items-center w-full h-full absolute z-30 hover:cursor-pointer`}
  >
    <>
      <div className="bg-teal-500 rounded-full w-20 h-20 flex justify-center items-center transition-transform duration-200 ease-out hover:scale-110 relative">
        <div className="absolute w-0 h-0 border-l-[30px] border-l-white border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent translate-x-[5px]"></div>
      </div>
    </>
  </div>
);

const DifficultyShow = ({children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="text-white capitalize" {...props}>
    {children}
  </div>
);

function stripWrappingQuotes(value: string) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
}

function getRawSearchParam(name: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const hashSearch = window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "";
  const searchSources = [hashSearch, window.location.search.replace(/^\?/, "")].filter(Boolean);

  for (const source of searchSources) {
    const value = new URLSearchParams(source).get(name);
    if (value !== null) {
      return stripWrappingQuotes(value);
    }
  }

  return undefined;
}

function getSearchString(search: Record<string, unknown>, name: string) {
  const rawValue = getRawSearchParam(name);
  if (rawValue !== undefined) {
    return rawValue;
  }

  const value = search[name];
  if (typeof value === "string") {
    return stripWrappingQuotes(value);
  }
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return value.toString();
  }
  return undefined;
}

function getSearchNumber(search: Record<string, unknown>, name: string) {
  const value = getSearchString(search, name);
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const SettingsAndInformation = () => {
  const {
    state,
    toggleShowHints,
    toggleShowOccurrences,
    toggleShowCircleMenu,
    toggleShowWrongEntries,
    toggleShowConflicts,
  } = useUserPreferences();
  const {t} = useTranslation();

  return (
    <div className="text-white">
      <div className="grid gap-4">
        <div className="md:block hidden">
          <h2 className="mb-2 text-3xl font-bold">{t("shortcuts")}</h2>
          <div className="grid gap-2">
            <ul className="list-disc pl-6">
              <li>{t("arrow_keys")}</li>
              <li>{t("number_keys")}</li>
              <li>{t("backspace")}</li>
              <li>{t("escape")}</li>
              <li>{t("hint")}</li>
              <li>{t("note_mode")}</li>
              <li>{t("undo")}</li>
              <li>{t("redo")}</li>
              <li>{t("copy_paste_notes")}</li>
            </ul>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-3xl font-bold">{t("settings")}</h2>
          <div className="grid gap-2">
            <Checkbox id="generated_notes" checked={state.showHints} onChange={toggleShowHints}>
              {t("show_auto_notes")}
            </Checkbox>
            <Checkbox id="highlight_wrong_entries" checked={state.showWrongEntries} onChange={toggleShowWrongEntries}>
              {t("highlight_wrong_entries")}
            </Checkbox>
            <Checkbox id="highlight_conflicts" checked={state.showConflicts} onChange={toggleShowConflicts}>
              {t("highlight_conflicts")}
            </Checkbox>
            <Checkbox id="circle_menu" checked={state.showCircleMenu} onChange={toggleShowCircleMenu}>
              {t("show_circle_menu")}
            </Checkbox>
            <Checkbox id="show_occurrences" checked={state.showOccurrences} onChange={toggleShowOccurrences}>
              {t("show_occurrences")}
            </Checkbox>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">{t("about")}</h2>
          <p className="text-white">
            {t("about_text")}{" "}
            <a target="_blank" className="underline" href="https://github.com/TN1ck/super-sudoku" rel="noreferrer">
              Github
            </a>
            .{" "}
            <a href="https://tn1ck.com" target="_blank" className="hover:underline" rel="noreferrer">
              {t("created_by")}
            </a>
            {t("report_issue")}{" "}
            <a
              target="_blank"
              className="underline"
              href="https://github.com/TN1ck/super-sudoku/issues"
              rel="noreferrer"
            >
              Github
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

const GameInner = () => {
  const {
    state: game,
    pauseGame,
    continueGame,
    wonGame,
    showMenu,
    hideMenu,
    selectCell,
    activateNotesMode,
    deactivateNotesMode,
    resetGame,
    copyNotes,
  } = useGame();
  const {state: sudokuState, setSudoku, setNumber, setNotes, clearCell, getHint, undo, redo} = useSudoku();
  const {state: userPreferencesState} = useUserPreferences();
  const sudoku = sudokuState.current;
  const {t} = useTranslation();
  const {getCollection} = useSudokuCollections();
  const collectionName = React.useMemo(() => {
    try {
      return translateCollectionName(getCollection(game.sudokuCollectionName).name);
    } catch (error) {
      console.error("Error loading sudoku collection:", error);
      return translateCollectionName(game.sudokuCollectionName);
    }
  }, [game.sudokuCollectionName, getCollection]);

  React.useEffect(() => {
    const isSolved = SudokuGame.isSolved(sudoku);
    if (isSolved) {
      wonGame();
    }
  }, [sudoku, wonGame]);
  const onVisibilityChange = React.useCallback(() => {
    if (document.visibilityState === "hidden") {
      pauseGame();
    } else {
      // So the user knows that it was paused, we wait a bit before continuing.
      setTimeout(() => {
        continueGame();
      }, 200);
    }
  }, [pauseGame, continueGame]);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange, false);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange, false);
      }
    };
  }, [onVisibilityChange]);

  const pausedGame = game.state === GameStateMachine.paused;
  const activeCell = findCell(sudoku, game.activeCellCoordinates);

  return (
    <Container>
      <div>
        <Shortcuts
          gameState={game.state}
          continueGame={continueGame}
          pauseGame={pauseGame}
          activateNotesMode={activateNotesMode}
          deactivateNotesMode={deactivateNotesMode}
          setNumber={setNumber}
          clearNumber={clearCell}
          getHint={getHint}
          setNotes={setNotes}
          undo={undo}
          redo={redo}
          sudoku={sudoku}
          activeCell={activeCell}
          notesMode={game.notesMode}
          showHints={userPreferencesState.showHints}
          selectCell={selectCell}
          clipboardNotes={game.clipboardNotes}
          copyNotes={copyNotes}
        />
        <header className="flex justify-between sm:items-center mt-4">
          <div className="flex text-white flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
            <div className="flex gap-2 items-center">
              <DifficultyShow data-testid="current-game-label">{`${collectionName} #${game.sudokuIndex + 1}`}</DifficultyShow>
              <ShareButton gameState={game} sudokuState={sudokuState} />
            </div>
            <div className="hidden sm:block">{"|"}</div>
            <GameTimer />
          </div>
          <div className="text-white text-lg sm:text-2xl font-bold flex items-center gap-2">{t("super_sudoku")}</div>
          <div className="flex">
            <div className="flex gap-2 flex-col justify-end items-end sm:flex-row">
              <div className="flex gap-2">
                <LanguageSelector />
                <DarkModeButton />
                <ClearGameButton
                  pauseGame={pauseGame}
                  continueGame={continueGame}
                  disabled={game.won || pausedGame}
                  clearGame={() => {
                    const simpleSudoku = cellsToSimpleSudoku(sudokuState.current);
                    const solved = solve(simpleSudoku);
                    if (solved.sudoku) {
                      setSudoku(simpleSudokuToCells(simpleSudoku, solved.sudoku));
                    }
                    resetGame();
                  }}
                />
              </div>
              <div className="flex gap-2">
                <PauseButton
                  disabled={game.won}
                  paused={pausedGame}
                  continueGame={continueGame}
                  pauseGame={pauseGame}
                />
                <NewGameButton />
              </div>
            </div>
          </div>
        </header>
        <div className="flex gap-4 flex-col md:flex-row">
          <main className="mt-4 flex-grow md:min-w-96 w-full">
            <Sudoku
              showWrongEntries={userPreferencesState.showWrongEntries && !pausedGame}
              showConflicts={userPreferencesState.showConflicts && !pausedGame}
              notesMode={game.notesMode}
              shouldShowMenu={game.showMenu && userPreferencesState.showCircleMenu && !pausedGame}
              sudoku={pausedGame ? emptyGrid : sudoku}
              showMenu={showMenu}
              hideMenu={hideMenu}
              selectCell={selectCell}
              showHints={userPreferencesState.showHints && !pausedGame}
              activeCell={pausedGame ? undefined : activeCell}
              setNumber={setNumber}
              setNotes={setNotes}
              clearNumber={clearCell}
            >
              {game.won && (
                <div className="absolute top-0 bottom-0 right-0 left-0 z-30 flex items-center justify-center rounded-sm bg-white dark:bg-black dark:bg-opacity-80 bg-opacity-80 text-black dark:text-white">
                  <div className="grid gap-8">
                    <div className="flex justify-center text-2xl">{t("congrats")}</div>
                    <div className="text-md flex justify-center">
                      <div className="grid">
                        <div className="flex justify-center">
                          {t(game.timesSolved === 1 ? "solved_time" : "solved_times", {count: game.timesSolved})}
                        </div>
                        <div className="flex justify-center">
                          <div>
                            {game.previousTimes.length > 0 && (
                              <div>{t("best_time", {time: formatDuration(Math.min(...game.previousTimes))})}</div>
                            )}
                            <div>{t("this_time", {time: formatDuration(game.secondsPlayed)})}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <NextSudokuButton gameState={game} />
                  </div>
                </div>
              )}

              <CenteredContinueButton visible={pausedGame && !game.won} onClick={continueGame} />
            </Sudoku>
          </main>
          <div className="grid gap-4 mt-4">
            <fieldset disabled={pausedGame} className="contents">
              <SudokuMenuNumbers
                notesMode={game.notesMode}
                showOccurrences={userPreferencesState.showOccurrences}
                activeCell={game.activeCellCoordinates}
                sudoku={sudokuState.current}
                showHints={userPreferencesState.showHints}
                setNumber={setNumber}
                setNotes={setNotes}
              />
              <SudokuMenuControls
                notesMode={game.notesMode}
                activeCellCoordinates={activeCell?.initial ? undefined : activeCell}
                clearCell={clearCell}
                activateNotesMode={activateNotesMode}
                deactivateNotesMode={deactivateNotesMode}
                getHint={getHint}
                canUndo={canUndo(sudokuState)}
                undo={undo}
              />
            </fieldset>
            <SettingsAndInformation />
          </div>
        </div>
      </div>
    </Container>
  );
};

// Save every 2 seconds.
const throttledSave = throttle(localStoragePlayedSudokuRepository.saveSudokuState, 2000);

export function AppProvider({children}: {children: React.ReactNode}) {
  const [saved] = React.useState(getCurrentSudokuFromStorage);
  const initialSudokuState = saved ? createSudokuState(saved.sudoku) : undefined;

  return (
    <GameProvider initialState={saved?.game}>
      <UserPreferencesProvider>
        <TimerProvider>
          <SudokuProvider initialState={initialSudokuState}>{children}</SudokuProvider>
        </TimerProvider>
      </UserPreferencesProvider>
    </GameProvider>
  );
}

const GameWithRouteManagement = () => {
  const location = useLocation();
  const {state: gameState, setGameState, newGame} = useGame();
  const {state: sudokuState, setSudoku} = useSudoku();
  const navigate = useNavigate();
  const {t} = useTranslation();

  const currentPath = location.pathname;
  const search = location.search as Record<string, unknown>;
  const sudokuIndex = getSearchNumber(search, "sudokuIndex");
  const sudoku = getSearchString(search, "sudoku");
  const sudokuCollectionName = getSearchString(search, "sudokuCollectionName");

  useEffect(() => {
    const flushSave = () => throttledSave.flush();
    window.addEventListener("pagehide", flushSave);
    return () => {
      window.removeEventListener("pagehide", flushSave);
      flushSave();
    };
  }, []);

  const currentGrid = stringifySudoku(cellsToSimpleSudoku(sudokuState.current));
  const matchesUrl =
    sudoku === currentGrid &&
    sudokuIndex !== undefined &&
    sudokuIndex - 1 === gameState.sudokuIndex &&
    sudokuCollectionName === gameState.sudokuCollectionName;
  useEffect(() => {
    if (currentPath === "/" && matchesUrl) {
      throttledSave(gameState, sudokuState);
      if (gameState.won) {
        throttledSave.flush();
      }
    }
  }, [currentPath, matchesUrl, gameState, sudokuState]);

  useEffect(() => {
    if (matchesUrl) {
      return;
    }
    const restoreCurrentUrl = () => {
      if (currentPath === "/") {
        navigate({
          replace: true,
          to: "/",
          search: {
            sudokuIndex: gameState.sudokuIndex + 1,
            sudoku: currentGrid,
            sudokuCollectionName: gameState.sudokuCollectionName,
          },
        });
      }
    };

    if (sudokuIndex === undefined || sudoku === undefined || sudokuCollectionName === undefined) {
      restoreCurrentUrl();
      return;
    }

    const entry = {sudokuCollectionName, sudokuIndex: sudokuIndex - 1};
    if (sudoku === currentGrid && !gameState.won) {
      setGameState({...gameState, ...entry});
      return;
    }

    // We only show a message if the user has played for more than 5 seconds and has not won.
    if (gameState.secondsPlayed > 5 && !gameState.won) {
      const areYouSure = confirm(
        t("confirm_new_game", {
          currentCollectionName: translateCollectionName(gameState.sudokuCollectionName),
          currentIndex: gameState.sudokuIndex + 1,
          newCollectionName: translateCollectionName(sudokuCollectionName),
          newIndex: sudokuIndex,
        }),
      );
      if (!areYouSure) {
        restoreCurrentUrl();
        return;
      }
    }

    // Finish any pending write for the outgoing puzzle before loading another.
    throttledSave.flush();
    try {
      const grid = parseSudoku(sudoku);
      const saved = localStoragePlayedSudokuRepository.getSudokuState(sudoku);
      if (saved && !saved.game.won) {
        setSudoku(saved.sudoku);
        setGameState({...saved.game, ...entry, state: GameStateMachine.running});
        return;
      }

      const solution = solve(grid).sudoku;
      if (solution) {
        setSudoku(simpleSudokuToCells(grid, solution));
        newGame(entry.sudokuIndex, sudokuCollectionName, saved?.game.timesSolved ?? 0, saved?.game.previousTimes ?? []);
        return;
      }
    } catch (error) {
      console.error(error);
    }

    alert(t("invalid_sudoku_url"));
    restoreCurrentUrl();
  }, [
    matchesUrl, sudokuIndex, sudoku, sudokuCollectionName, currentGrid, currentPath,
    navigate, gameState, setGameState, setSudoku, newGame, t,
  ]);

  return <GameInner />;
};

const Game = () => {
  return (
    <AppProvider>
      <GameWithRouteManagement />
    </AppProvider>
  );
};

export default Game;
