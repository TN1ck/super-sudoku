import * as React from "react";
import {useEffect} from "react";
import {useLocation, useNavigate} from "@tanstack/react-router";
import {useTranslation} from "react-i18next";

import Button from "src/components/Button";
import {DarkModeButton} from "src/components/DarkModeButton";
import LanguageSelector from "src/components/LanguageSelector";
import {Container} from "src/components/Layout";
import {Sudoku} from "src/components/sudoku/Sudoku";
import SudokuMenuControls from "src/components/sudoku/SudokuMenuControls";
import SudokuMenuNumbers from "src/components/sudoku/SudokuMenuNumbers";
import {GameProvider, GameState, GameStateMachine, useGame} from "src/context/GameContext";
import {canUndo, createSudokuState, emptyGrid, SudokuProvider, SudokuState, useSudoku} from "src/context/SudokuContext";
import {UserPreferencesProvider, useUserPreferences} from "src/context/UserPreferencesContext";
import {
  getCurrentSudokuFromStorage,
  isLaterAttempt,
  isPuzzleRecordKey,
  localStoragePlayedSudokuRepository,
} from "src/lib/database/playedSudokus";
import {solve} from "src/lib/engine/solverAC3";
import {Cell} from "src/lib/engine/types";
import {
  cellsToSimpleSudoku,
  findCell,
  parseSudoku,
  simpleSudokuToCells,
  stringifySudoku,
  SUDOKU_NUMBERS,
} from "src/lib/engine/utility";
import SudokuGame from "src/lib/game/SudokuGame";
import {resolveCollectionDisplayName, useSudokuCollections} from "src/lib/game/sudokus";
import {createGameSearchParams, createShareUrl, parseGameSearchParams} from "src/utils/gameUrl";
import {throttle} from "src/utils/throttle";

import GameTimer from "./Game/GameTimer";
import {InfoModal, InfoPanelType} from "./Game/InfoModal";
import SettingsAndInformation from "./Game/SettingsAndInformation";
import Shortcuts from "./Game/shortcuts/Shortcuts";
import {WinOverlay} from "./Game/WinOverlay";

function resetBoardCells(cells: Cell[]): Cell[] {
  const hasCompleteSolution = cells.length === 81 && cells.every((c) => SUDOKU_NUMBERS.includes(c.solution));
  if (hasCompleteSolution) {
    return cells.map((cell) => ({
      x: cell.x,
      y: cell.y,
      number: cell.initial ? cell.number : 0,
      notes: [],
      initial: cell.initial,
      solution: cell.solution,
    }));
  }

  const simpleSudoku = cellsToSimpleSudoku(cells);
  const solved = solve(simpleSudoku);
  return simpleSudokuToCells(simpleSudoku, solved.sudoku ?? undefined);
}

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
  const mountedRef = React.useRef(true);
  const pendingRef = React.useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const clearGameLocal = async () => {
    if (pendingRef.current) {
      return;
    }
    pendingRef.current = true;
    try {
      pauseGame();
      // Wait briefly so the paused state renders before the blocking confirm dialog opens.
      await new Promise((resolve) => setTimeout(resolve, 30));
      if (!mountedRef.current) {
        return;
      }
      const areYouSure = confirm(t("confirm_clear"));
      if (!areYouSure) {
        continueGame();
        return;
      }
      clearGame();
    } finally {
      pendingRef.current = false;
    }
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
    await navigate({to: "/select-game"});
  };

  return (
    <Button className="bg-teal-600 text-white dark:bg-teal-600" onClick={pauseAndChoose}>
      {t("new_game")}
    </Button>
  );
};

const ShareButton: React.FC<{
  gameState: GameState;
  sudokuState: SudokuState;
}> = ({gameState, sudokuState}) => {
  const [copied, setCopied] = React.useState(false);
  const resetTimerRef = React.useRef<number | undefined>(undefined);
  const {t} = useTranslation();

  useEffect(() => {
    return () => {
      window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Error copying to clipboard", error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (fallbackError) {
        console.error("Fallback clipboard copy failed", fallbackError);
      }
    }
  };

  const handleShare = async () => {
    const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudokuState.current));
    const shareUrl = createShareUrl(stringifiedSudoku, gameState.sudokuIndex, gameState.sudokuCollectionName);

    await copyToClipboard(shareUrl);
    setCopied(true);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button
      aria-label={t("share")}
      className="rounded-md border-none bg-transparent p-1 text-white hover:cursor-pointer hover:bg-gray-500"
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
    className={`${visible ? "flex" : "hidden"} absolute z-30 h-full w-full items-center justify-center hover:cursor-pointer`}
  >
    <div className="duration-200 relative flex h-20 w-20 items-center justify-center rounded-full bg-teal-500 transition-transform ease-out hover:scale-110">
      <div className="absolute h-0 w-0 translate-x-[5px] border-b-[20px] border-l-[30px] border-t-[20px] border-b-transparent border-l-white border-t-transparent" />
    </div>
  </div>
);

const DifficultyShow = ({children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="capitalize text-white" {...props}>
    {children}
  </div>
);

const GameInner = ({onAdvance}: {onAdvance: () => void}) => {
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
  const [infoPanel, setInfoPanel] = React.useState<InfoPanelType | null>(null);
  const closeInfoPanel = React.useCallback(() => setInfoPanel(null), []);

  const collectionName = resolveCollectionDisplayName(game.sudokuCollectionName, getCollection, t);

  useEffect(() => {
    if (SudokuGame.isSolved(sudoku)) {
      wonGame();
    }
  }, [sudoku, wonGame]);

  // Only auto-resume when the game was auto-paused by tab hiding, not when manually paused.
  const gameStateRef = React.useRef(game.state);
  React.useLayoutEffect(() => {
    gameStateRef.current = game.state;
  }, [game.state]);
  const autoPausedByHiddenRef = React.useRef(false);
  const resumeTimeoutRef = React.useRef<number | undefined>(undefined);

  useEffect(() => {
    if (game.state === GameStateMachine.running) {
      autoPausedByHiddenRef.current = false;
    }
  }, [game.state]);

  useEffect(() => {
    const onVisibilityChange = () => {
      window.clearTimeout(resumeTimeoutRef.current);
      if (document.visibilityState === "hidden") {
        if (gameStateRef.current === GameStateMachine.running) {
          autoPausedByHiddenRef.current = true;
          pauseGame();
        }
      } else if (autoPausedByHiddenRef.current) {
        resumeTimeoutRef.current = window.setTimeout(() => {
          autoPausedByHiddenRef.current = false;
          continueGame();
        }, 200);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(resumeTimeoutRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pauseGame, continueGame]);

  const pausedGame = game.state === GameStateMachine.paused;
  const activeCell = findCell(sudoku, game.activeCellCoordinates);

  return (
    <Container>
      <div>
        <Shortcuts
          disabled={infoPanel !== null}
          gameState={game.state}
          continueGame={continueGame}
          pauseGame={pauseGame}
          activateNotesMode={activateNotesMode}
          deactivateNotesMode={deactivateNotesMode}
          setNumber={setNumber}
          clearCell={clearCell}
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
        <header className="mt-4 flex justify-between sm:items-center">
          <div className="flex flex-col gap-2 text-white sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <DifficultyShow data-testid="current-game-label">{`${collectionName} #${game.sudokuIndex + 1}`}</DifficultyShow>
              <ShareButton gameState={game} sudokuState={sudokuState} />
            </div>
            <div className="hidden sm:block">{"|"}</div>
            <GameTimer />
          </div>
          <div className="flex items-center gap-2 text-lg font-bold text-white sm:text-2xl">{t("super_sudoku")}</div>
          <div className="flex">
            <div className="flex flex-col items-end justify-end gap-2 sm:flex-row">
              <div className="flex gap-2">
                <LanguageSelector />
                <DarkModeButton />
                <ClearGameButton
                  pauseGame={pauseGame}
                  continueGame={continueGame}
                  disabled={game.won || pausedGame}
                  clearGame={() => {
                    setSudoku(resetBoardCells(sudokuState.current));
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
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start">
          <main className="w-full min-w-0 md:flex-1">
            <Sudoku
              showWrongEntries={userPreferencesState.showWrongEntries && !pausedGame}
              showConflicts={userPreferencesState.showConflicts && !pausedGame}
              notesMode={game.notesMode}
              showNotesMenu={game.showNotes}
              shouldShowMenu={game.showMenu && userPreferencesState.showCircleMenu && !pausedGame}
              sudoku={pausedGame ? emptyGrid : sudoku}
              showMenu={showMenu}
              hideMenu={hideMenu}
              selectCell={selectCell}
              showHints={userPreferencesState.showHints && !pausedGame}
              activeCell={pausedGame ? undefined : activeCell}
              setNumber={setNumber}
              setNotes={setNotes}
              clearCell={clearCell}
            >
              {game.won && <WinOverlay gameState={game} onAdvance={onAdvance} />}
              <CenteredContinueButton visible={pausedGame && !game.won} onClick={continueGame} />
            </Sudoku>
          </main>
          <aside className="grid gap-4 md:w-[clamp(17rem,28vw,22rem)] md:flex-none md:shrink-0">
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
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <button
                type="button"
                className="hidden transition-colors hover:text-white md:inline-flex"
                onClick={(e) => {
                  setInfoPanel("shortcuts");
                  e.currentTarget.blur();
                }}
              >
                {t("shortcuts")}
              </button>
              <span className="hidden text-gray-600 md:inline" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                className="inline-flex transition-colors hover:text-white"
                onClick={(e) => {
                  setInfoPanel("about");
                  e.currentTarget.blur();
                }}
              >
                {t("about")}
              </button>
            </div>
          </aside>
        </div>
        <InfoModal panel={infoPanel} onClose={closeInfoPanel} />
      </div>
    </Container>
  );
};

// Save every 2 seconds.
const throttledSave = throttle(localStoragePlayedSudokuRepository.saveSudokuState, 2000);

export function AppProvider({children}: {children: React.ReactNode}) {
  const [saved] = React.useState(getCurrentSudokuFromStorage);
  const [initialSudokuState] = React.useState(() => (saved ? createSudokuState(saved.sudoku) : undefined));

  return (
    <GameProvider initialState={saved?.game}>
      <UserPreferencesProvider>
        <SudokuProvider initialState={initialSudokuState}>{children}</SudokuProvider>
      </UserPreferencesProvider>
    </GameProvider>
  );
}

const Game = () => {
  const advancing = React.useRef(false);
  const location = useLocation();
  const {state: gameState, setGameState, newGame} = useGame();
  const {state: sudokuState, setSudoku} = useSudoku();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {getCollection} = useSudokuCollections();

  const currentPath = location.pathname;
  const {sudokuIndex, sudoku, sudokuCollectionName} = parseGameSearchParams(location.search as Record<string, unknown>);

  useEffect(() => {
    const flushSave = () => throttledSave.flush();
    window.addEventListener("pagehide", flushSave);
    return () => {
      window.removeEventListener("pagehide", flushSave);
      flushSave();
    };
  }, []);

  const currentGrid = stringifySudoku(cellsToSimpleSudoku(sudokuState.current));
  const latestGame = React.useRef(gameState);
  React.useLayoutEffect(() => {
    latestGame.current = gameState;
  }, [gameState]);
  useEffect(() => {
    const syncAttempt = () => {
      const game = latestGame.current;
      const saved = localStoragePlayedSudokuRepository.getSudokuState(currentGrid);
      if (saved && isLaterAttempt(saved.game, game)) {
        throttledSave.cancel();
        setSudoku(saved.sudoku);
        setGameState({...saved.game, sudokuIndex: game.sudokuIndex, sudokuCollectionName: game.sudokuCollectionName});
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (isPuzzleRecordKey(event.key, currentGrid)) {
        syncAttempt();
      }
    };
    // The other tab may have won while this tab was in the puzzle picker.
    syncAttempt();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [currentGrid, setGameState, setSudoku]);

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
      advancing.current = false;
      return;
    }
    const shouldReplayOnWin = advancing.current;
    advancing.current = false;

    const restoreCurrentUrl = () => {
      if (currentPath === "/") {
        void navigate({
          replace: true,
          to: "/",
          search: createGameSearchParams(currentGrid, gameState.sudokuIndex, gameState.sudokuCollectionName),
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

    // Only confirm if the user has played for more than 5 seconds and has not won.
    if (gameState.secondsPlayed > 5 && !gameState.won) {
      const areYouSure = confirm(
        t("confirm_new_game", {
          currentCollectionName: resolveCollectionDisplayName(gameState.sudokuCollectionName, getCollection, t),
          currentIndex: gameState.sudokuIndex + 1,
          newCollectionName: resolveCollectionDisplayName(sudokuCollectionName, getCollection, t),
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
      // Only the Next button asks to replay an already completed destination.
      const startReplay = shouldReplayOnWin && saved?.game.won;
      if (saved && !startReplay) {
        setSudoku(saved.sudoku);
        setGameState({
          ...saved.game,
          ...entry,
          state: saved.game.won ? GameStateMachine.paused : GameStateMachine.running,
        });
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
    matchesUrl,
    sudokuIndex,
    sudoku,
    sudokuCollectionName,
    currentGrid,
    currentPath,
    navigate,
    gameState,
    setGameState,
    setSudoku,
    newGame,
    getCollection,
    t,
  ]);

  return (
    <GameInner
      onAdvance={() => {
        advancing.current = true;
      }}
    />
  );
};

export default Game;
