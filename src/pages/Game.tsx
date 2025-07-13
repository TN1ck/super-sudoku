import * as React from "react";

import {useGame, GameStateMachine, GameState, INITIAL_GAME_STATE, GameProvider} from "src/context/GameContext";
import {emptyGrid, INITIAL_SUDOKU_STATE, SudokuProvider, SudokuState, useSudoku} from "src/context/SudokuContext";

import {Sudoku} from "src/components/sudoku/Sudoku";

import GameTimer from "./Game/GameTimer";

import Button from "src/components/Button";
import SudokuGame from "src/lib/game/SudokuGame";
import SudokuMenuNumbers from "src/components/sudoku/SudokuMenuNumbers";
import SudokuMenuControls from "src/components/sudoku/SudokuMenuControls";
import {Container} from "src/components/Layout";
import Shortcuts from "./Game/shortcuts/Shortcuts";
import Checkbox from "src/components/Checkbox";
import {cellsToSimpleSudoku, stringifySudoku, parseSudoku} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3";
import {Link, useLocation, useNavigate} from "@tanstack/react-router";
import {localStoragePlayedSudokuRepository} from "src/lib/database/playedSudokus";
import {formatDuration} from "src/utils/format";
import {throttle} from "lodash";
import {TimerProvider} from "src/context/TimerContext";
import {useEffect} from "react";
import {CellCoordinates, SimpleSudoku} from "src/lib/engine/types";
import {DarkModeButton} from "src/components/DarkModeButton";

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
  return (
    <Button disabled={disabled} onClick={paused ? continueGame : pauseGame}>
      {paused ? "Continue" : "Pause"}
    </Button>
  );
}

const ClearGameButton: React.FC<{
  clearGame: () => void;
  pauseGame: () => void;
  continueGame: () => void;
  disabled: boolean;
}> = ({clearGame, pauseGame, continueGame, disabled}) => {
  const clearGameLocal = async () => {
    pauseGame();
    // Wait 50ms to make sure the game is shown as paused when in the confirm dialog.
    await new Promise((resolve) => setTimeout(resolve, 30));
    const areYouSure = confirm("Are you sure? This will clear the sudoku and reset the timer.");
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
      {"Clear"}
    </Button>
  );
};

const NewGameButton: React.FC = () => {
  const {pauseGame} = useGame();
  const navigate = useNavigate();

  const pauseAndChoose = async () => {
    pauseGame();
    await navigate({
      to: "/select-game",
    });
  };

  return (
    <Button className="bg-teal-600 dark:bg-teal-600 text-white" onClick={pauseAndChoose}>
      {"New"}
    </Button>
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
    const shareUrl = `${window.location.origin}/?sudokuIndex=${gameState.sudokuIndex + 1}&sudoku="${stringifiedSudoku}"&sudokuCollectionName=${gameState.sudokuCollectionName}`;

    await copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="text-white hover:cursor-pointer p-1 hover:bg-gray-500 rounded-md" onClick={handleShare}>
      {copied ? "🔗 Copied!" : "🔗 Share"}
    </div>
  );
};

const CenteredContinueButton: React.FC<{visible: boolean; onClick: () => void}> = ({visible, onClick}) => (
  <div
    onClick={onClick}
    className={`${visible ? "flex" : "hidden"} justify-center items-center w-full h-full absolute z-30 hover:cursor-pointer`}
  >
    <div className="bg-teal-500 rounded-full w-20 h-20 flex justify-center items-center transition-transform duration-200 ease-out hover:scale-110 relative">
      <div className="absolute w-0 h-0 border-l-[30px] border-l-white border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent translate-x-[5px]"></div>
    </div>
  </div>
);

const DifficultyShow = ({children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="text-white capitalize" {...props}>
    {children}
  </div>
);

const SettingsAndInformation = () => {
  const {
    state: game,
    toggleShowHints,
    toggleShowOccurrences,
    toggleShowCircleMenu,
    toggleShowWrongEntries,
    toggleShowConflicts,
  } = useGame();

  return (
    <div className="text-white">
      <div className="grid gap-4">
        <div className="md:block hidden">
          <h2 className="mb-2 text-3xl font-bold">Shortcuts</h2>
          <div className="grid gap-2">
            <ul className="list-disc pl-6">
              <li>Arrow keys: Move around the board</li>
              <li>Number keys: Write a note or set the sudoku number</li>
              <li>Backspace: Delete a number</li>
              <li>Escape: Pause/unpause the game</li>
              <li>H: Hint</li>
              <li>N: Enter/exit note mode</li>
              <li>CTRL + Z: Undo</li>
              <li>CTRL + Y: Redo</li>
            </ul>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-3xl font-bold">Settings</h2>
          <div className="grid gap-2">
            <Checkbox id="generated_notes" checked={game.showHints} onChange={toggleShowHints}>
              {"Show auto generated notes"}
            </Checkbox>
            <Checkbox id="highlight_wrong_entries" checked={game.showWrongEntries} onChange={toggleShowWrongEntries}>
              {"Highlight wrong entries"}
            </Checkbox>
            <Checkbox id="highlight_conflicts" checked={game.showConflicts} onChange={toggleShowConflicts}>
              {"Highlight conflicts"}
            </Checkbox>
            <Checkbox id="circle_menu" checked={game.showCircleMenu} onChange={toggleShowCircleMenu}>
              {"Show circle menu when a cell is clicked (desktop only)"}
            </Checkbox>
            <Checkbox id="show_occurrences" checked={game.showOccurrences} onChange={toggleShowOccurrences}>
              {"Show occurrences of numbers in number buttons"}
            </Checkbox>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">About</h2>
          <p className="text-white">
            This sudoku app is and will be free of charge, free of ads and free of tracking. Its source code is
            available at{" "}
            <a target="_blank" className="underline" href="https://github.com/TN1ck/super-sudoku" rel="noreferrer">
              Github
            </a>
            .{" "}
            <a href="https://tn1ck.com" target="_blank" className="hover:underline" rel="noreferrer">
              {"Created by Tom Nick."}
            </a>
            If you find a bug or experience any issues, please report it on{" "}
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

const GameInner: React.FC<{
  sudokuState: SudokuState;
  setSudoku: (sudoku: SimpleSudoku, solvedSudoku: SimpleSudoku) => void;
  setNumber: (cellCoordinates: CellCoordinates, number: number) => void;
  setNotes: (cellCoordinates: CellCoordinates, notes: number[]) => void;
  clearCell: (cellCoordinates: CellCoordinates) => void;
  getHint: (cellCoordinates: CellCoordinates) => void;
  undo: () => void;
  redo: () => void;
  game: GameState;
  pauseGame: () => void;
  continueGame: () => void;
  wonGame: () => void;
  showMenu: () => void;
  selectCell: (cellCoordinates: CellCoordinates) => void;
  activateNotesMode: () => void;
  hideMenu: () => void;
  resetGame: () => void;
  deactivateNotesMode: () => void;
}> = ({
  sudokuState,
  setSudoku,
  setNumber,
  setNotes,
  clearCell,
  getHint,
  undo,
  redo,
  game,
  pauseGame,
  continueGame,
  wonGame,
  showMenu,
  selectCell,
  activateNotesMode,
  hideMenu,
  resetGame,
  deactivateNotesMode,
}) => {
  const canUndo = sudokuState.historyIndex < sudokuState.history.length - 1;
  const sudoku = sudokuState.current;

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
  const activeCell = game.activeCellCoordinates
    ? sudoku.find((s) => {
        return s.x === game.activeCellCoordinates!.x && s.y === game.activeCellCoordinates!.y;
      })
    : undefined;

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
          showHints={game.showHints}
          selectCell={selectCell}
        />
        <header className="flex justify-between sm:items-center mt-4">
          <div className="flex text-white flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
            <div className="flex gap-2 items-center">
              <DifficultyShow>{`${game.sudokuCollectionName} #${game.sudokuIndex + 1}`}</DifficultyShow>
              <ShareButton gameState={game} sudokuState={sudokuState} />
            </div>
            <div className="hidden sm:block">{"|"}</div>
            <GameTimer />
          </div>
          <div className="text-white text-lg sm:text-2xl font-bold">Super Sudoku</div>
          <div className="flex">
            <div className="flex gap-2 flex-col justify-end items-end sm:flex-row">
              <div className="flex gap-2">
                <DarkModeButton />
                <ClearGameButton
                  pauseGame={pauseGame}
                  continueGame={continueGame}
                  disabled={game.won || game.state === GameStateMachine.paused}
                  clearGame={() => {
                    const simpleSudoku = cellsToSimpleSudoku(sudokuState.current);
                    const solved = solve(simpleSudoku);
                    if (solved.sudoku) {
                      setSudoku(simpleSudoku, solved.sudoku);
                    }
                    resetGame();
                  }}
                />
              </div>
              <div className="flex gap-2">
                <PauseButton
                  disabled={game.won}
                  paused={game.state === GameStateMachine.paused}
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
              showWrongEntries={game.showWrongEntries && game.state === GameStateMachine.running}
              showConflicts={game.showConflicts && game.state === GameStateMachine.running}
              notesMode={game.notesMode}
              shouldShowMenu={game.showMenu && game.showCircleMenu && game.state === GameStateMachine.running}
              sudoku={game.state === GameStateMachine.paused ? emptyGrid : sudoku}
              showMenu={showMenu}
              hideMenu={hideMenu}
              selectCell={selectCell}
              showHints={game.showHints && game.state === GameStateMachine.running}
              activeCell={game.state === GameStateMachine.running ? activeCell : undefined}
              setNumber={setNumber}
              setNotes={setNotes}
              clearNumber={clearCell}
            >
              {game.won && (
                <div className="absolute top-0 bottom-0 right-0 left-0 z-30 flex items-center justify-center rounded-sm bg-white dark:bg-black dark:bg-opacity-80 bg-opacity-80 text-black dark:text-white">
                  <div className="grid gap-8">
                    <div className="flex justify-center text-2xl">{"🎉 Congrats, you won! 🎉"}</div>
                    <div className="text-md flex justify-center">
                      <div className="grid">
                        <div className="flex justify-center">{`You solved this sudoku ${game.timesSolved} ${
                          game.timesSolved === 1 ? "time" : "times"
                        }`}</div>
                        <div className="flex justify-center">
                          <div>
                            {game.previousTimes.length > 0 && (
                              <div>{`Best time: ${formatDuration(Math.min(...game.previousTimes))}`}</div>
                            )}
                            <div>{`This time: ${formatDuration(game.secondsPlayed)}`}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link to="/select-game" className="w-full">
                      <Button className="bg-teal-700 text-white w-full">{"Select next sudoku"}</Button>
                    </Link>
                  </div>
                </div>
              )}

              <CenteredContinueButton visible={pausedGame && !game.won} onClick={continueGame} />
            </Sudoku>
          </main>
          <div className="grid gap-4 mt-4">
            <SudokuMenuNumbers
              notesMode={game.notesMode}
              showOccurrences={game.showOccurrences}
              activeCell={game.activeCellCoordinates}
              sudoku={sudokuState.current}
              showHints={game.showHints}
              setNumber={setNumber}
              setNotes={setNotes}
            />
            <SudokuMenuControls
              notesMode={game.notesMode}
              activeCellCoordinates={game.activeCellCoordinates ?? {x: 0, y: 0}}
              clearCell={clearCell}
              activateNotesMode={activateNotesMode}
              deactivateNotesMode={deactivateNotesMode}
              getHint={getHint}
              canUndo={canUndo}
              undo={undo}
            />
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
  // Load initial state from persistence
  const currentSudokuKey = localStoragePlayedSudokuRepository.getCurrentSudokuKey();
  const currentSudoku = currentSudokuKey
    ? localStoragePlayedSudokuRepository.getSudokuState(currentSudokuKey)
    : undefined;

  const initialGameState: GameState = currentSudoku ? currentSudoku.game : INITIAL_GAME_STATE;

  const initialSudokuState: SudokuState = currentSudoku
    ? {
        history: [currentSudoku.sudoku],
        historyIndex: 0,
        current: currentSudoku.sudoku,
      }
    : INITIAL_SUDOKU_STATE;

  return (
    <GameProvider initialState={initialGameState}>
      <TimerProvider>
        <SudokuProvider initialState={initialSudokuState}>{children}</SudokuProvider>
      </TimerProvider>
    </GameProvider>
  );
}

const GameWithRouteManagement = () => {
  const location = useLocation();
  const {
    setGameState,
    state: gameState,
    continueGame,
    newGame,
    pauseGame,
    wonGame,
    showMenu,
    selectCell,
    activateNotesMode,
    deactivateNotesMode,
    resetGame,
    hideMenu,
  } = useGame();
  const {
    setSudokuState,
    state: sudokuState,
    setSudoku,
    setNumber,
    setNotes,
    clearCell,
    getHint,
    undo,
    redo,
  } = useSudoku();
  const [initialized, setInitialized] = React.useState(false);
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const search = location.search;
  const sudokuIndex = search["sudokuIndex"] as number | undefined;
  const sudoku = search["sudoku"] as string | undefined;
  const sudokuCollectionName = search["sudokuCollectionName"] as string | undefined;

  useEffect(() => {
    if (gameState && sudokuState && initialized && currentPath === "/") {
      throttledSave(gameState, sudokuState);
      // Also update the URL to the current game state if it differs.
      const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudokuState.current));
      const shouldUpdateUrl = stringifiedSudoku !== sudoku;
      if (shouldUpdateUrl) {
        navigate({
          replace: true,
          to: "/",
          search: {
            sudokuIndex: gameState.sudokuIndex + 1,
            sudoku: stringifiedSudoku,
            sudokuCollectionName: gameState.sudokuCollectionName,
          },
        });
      }
    }
  }, [gameState, sudokuState, initialized, currentPath, sudoku, navigate]);

  // In the AppProvider, we load the sudoku from the local storage.
  // TODO: Combine it with this logic.
  React.useEffect(() => {
    // If the URL does not contain a sudoku, we don't need to do anything.
    if (sudokuIndex === undefined || sudoku === undefined || sudokuCollectionName === undefined) {
      setInitialized(true);
      return;
    }

    const currentSudoku = cellsToSimpleSudoku(sudokuState.current);
    // If the current sudoku is the same as the one in the URL, we don't need to do anything.
    if (stringifySudoku(currentSudoku) === sudoku) {
      setInitialized(true);
      return;
    }

    console.info("Loading sudoku from URL", sudokuIndex, sudoku, sudokuCollectionName);
    // We only show a message if the user has played for more than 5 seconds and has not won.
    if (gameState.secondsPlayed > 5 && !gameState.won) {
      const areYouSure = confirm(
        `You are currently playing sudoku ${gameState.sudokuCollectionName} #${gameState.sudokuIndex + 1}, do you want to pause it and start ${sudokuCollectionName} #${sudokuIndex}?`,
      );
      if (!areYouSure) {
        setInitialized(true);
        return;
      }
    }

    // The user wants to play the sudoku from the URL.
    try {
      const parsedSudoku = parseSudoku(sudoku);
      const solvedSudoku = solve(parsedSudoku);
      if (solvedSudoku.sudoku) {
        setSudoku(parsedSudoku, solvedSudoku.sudoku);
      } else {
        alert("The URL contains an invalid sudoku.");
        setInitialized(true);
        return;
      }
    } catch (error) {
      alert("The URL contains an invalid sudoku.");
      setInitialized(true);
      console.error(error);
      return;
    }

    const storedSudoku = localStoragePlayedSudokuRepository.getSudokuState(sudoku);
    newGame(
      sudokuIndex - 1, // We subtract 1 because the index is 0-based, but we want to display it as 1-based in the URL.
      sudokuCollectionName,
      storedSudoku?.game.timesSolved ?? 0,
      storedSudoku?.game.previousTimes ?? [],
    );

    // If we have a stored sudoku, we need to set the game state and sudoku state.
    if (storedSudoku && !storedSudoku.game.won) {
      setGameState({
        ...storedSudoku.game,
      });
      setSudokuState({
        current: storedSudoku.sudoku,
        history: [storedSudoku.sudoku],
        historyIndex: 0,
      });
    }
    setInitialized(true);
    continueGame();
  }, [
    sudokuIndex,
    sudoku,
    sudokuCollectionName,
    setGameState,
    setSudokuState,
    setInitialized,
    continueGame,
    sudokuState,
    gameState.secondsPlayed,
    gameState.won,
    gameState.sudokuCollectionName,
    gameState.sudokuIndex,
    newGame,
    setSudoku,
  ]);

  return (
    <GameInner
      sudokuState={sudokuState}
      setSudoku={setSudoku}
      setNumber={setNumber}
      setNotes={setNotes}
      clearCell={clearCell}
      getHint={getHint}
      undo={undo}
      redo={redo}
      game={gameState}
      pauseGame={pauseGame}
      continueGame={continueGame}
      wonGame={wonGame}
      showMenu={showMenu}
      selectCell={selectCell}
      activateNotesMode={activateNotesMode}
      hideMenu={hideMenu}
      resetGame={resetGame}
      deactivateNotesMode={deactivateNotesMode}
    />
  );
};

const Game = () => {
  return (
    <AppProvider>
      <GameWithRouteManagement />
    </AppProvider>
  );
};

export default Game;
