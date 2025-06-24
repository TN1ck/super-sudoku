import * as React from "react";

import {useGame, GameStateMachine} from "src/context/GameContext";
import {useSudoku} from "src/context/SudokuContext";

import {Sudoku} from "src/components/sudoku/Sudoku";

import GameTimer from "./Game/GameTimer";

import Button from "src/components/Button";
import SudokuGame from "src/lib/game/SudokuGame";
import SudokuMenuNumbers from "src/pages/Game/GameControls/GameControlNumbers";
import SudokuMenuControls from "src/pages/Game/GameControls/GameControlActions";
import {Container} from "src/components/Layout";
import Shortcuts from "./Game/shortcuts/Shortcuts";
import Checkbox from "src/components/Checkbox";
import {cellsToSimpleSudoku, stringifySudoku, parseSudoku} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3";
import {useLocation, useNavigate} from "@tanstack/react-router";
import {DIFFICULTY} from "src/lib/engine/types";
import {getState, StoredSudokuState} from "src/lib/game/persistence";

const SudokuMenuNumbersConnected: React.FC = () => {
  const {state: gameState} = useGame();
  const {state: sudokuState, setNumber, setNotes} = useSudoku();

  return (
    <SudokuMenuNumbers
      notesMode={gameState.notesMode}
      showOccurrences={gameState.showOccurrences}
      activeCell={gameState.activeCellCoordinates}
      sudoku={sudokuState.current}
      showHints={gameState.showHints}
      setNumber={setNumber}
      setNotes={setNotes}
    />
  );
};

function PauseButton({
  state,
  pauseGame,
  continueGame,
}: {
  state: GameStateMachine;
  pauseGame: () => void;
  continueGame: () => void;
}) {
  return (
    <Button
      disabled={state === GameStateMachine.wonGame}
      onClick={state === GameStateMachine.paused ? continueGame : pauseGame}
    >
      {state === GameStateMachine.paused ? "Continue" : "Pause"}
    </Button>
  );
}

const ClearGameButton: React.FC = () => {
  const {state, resetGame, pauseGame, continueGame} = useGame();
  const {state: sudokuState} = useSudoku();
  const {setSudoku} = useSudoku();

  const clearGame = async () => {
    pauseGame();
    // Wait 50ms to make sure the game is shown as paused when in the confirm dialog.
    await new Promise((resolve) => setTimeout(resolve, 30));
    const areYouSure = confirm("Are you sure? This will clear the sudoku and reset the timer.");
    if (!areYouSure) {
      continueGame();
      return;
    }
    const simpleSudoku = cellsToSimpleSudoku(sudokuState.current);
    const solved = solve(simpleSudoku);
    if (solved.sudoku) {
      setSudoku(simpleSudoku, solved.sudoku);
    }
    resetGame();
    // Wait 100ms as we have to wait until the updateTimer is called (should normally take 1/60 second)
    // This is certainly not ideal and should be fixed there.
    await new Promise((resolve) => setTimeout(resolve, 100));
    continueGame();
  };

  return (
    <Button
      disabled={state.state === GameStateMachine.wonGame || state.state === GameStateMachine.paused}
      onClick={clearGame}
    >
      {"Clear"}
    </Button>
  );
};

const NewGameButton: React.FC = () => {
  const {pauseGame} = useGame();
  const navigate = useNavigate();

  const pauseAndChoose = () => {
    pauseGame();
    navigate({to: "/new-game"});
  };

  return (
    <Button className="bg-teal-600 dark:bg-teal-600 text-white" onClick={pauseAndChoose}>
      {"New"}
    </Button>
  );
};

const ToggleDarkModeButton = () => {
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        return JSON.parse(savedMode);
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }
  }, [darkMode]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newMode = e.matches;
      setDarkMode(newMode);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("darkMode", JSON.stringify(newMode));
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prevMode: boolean) => {
      const newMode = !prevMode;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("darkMode", JSON.stringify(newMode));
      }
      return newMode;
    });
  };

  return (
    <button onClick={toggleDarkMode} className="md:h-10 md:w-10 h-8 w-8 rounded-sm p-1 hover:bg-gray-800">
      <svg className="fill-violet-700 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
      </svg>
      <svg className="fill-yellow-500 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path>
      </svg>
    </button>
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

const Game: React.FC = () => {
  const {
    state: game,
    pauseGame,
    continueGame,
    wonGame,
    showMenu,
    restartGame,
    selectCell,
    hideMenu,
    toggleShowHints,
    toggleShowOccurrences,
    toggleShowCircleMenu,
    toggleShowWrongEntries,
    toggleShowConflicts,
  } = useGame();

  const {state: sudokuState, setSudoku} = useSudoku();
  const sudoku = sudokuState.current;

  React.useEffect(() => {
    // check if won
    const wasSolved = SudokuGame.isSolved(sudoku);
    const isSolved = SudokuGame.isSolved(sudoku);
    if (isSolved && !wasSolved) {
      wonGame();
    }
  }, [sudoku, wonGame]);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange, false);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange, false);
      }
    };
  }, []);

  const onVisibilityChange = React.useCallback(() => {
    if (document.visibilityState === "hidden") {
      pauseGame();
    } else {
      // So the user knows that it was paused, we wait a bit before continuing.
      setTimeout(() => {
        continueGame();
      }, 200);
    }
  }, [game.state, pauseGame, continueGame]);

  const pausedGame = game.state === GameStateMachine.paused;
  const activeCell = game.activeCellCoordinates
    ? sudoku.find((s) => {
        return s.x === game.activeCellCoordinates!.x && s.y === game.activeCellCoordinates!.y;
      })
    : undefined;

  const handleRestartGame = React.useCallback(() => {
    restartGame(game.sudokuIndex, game.difficulty, game.timesSolved, game.secondsPlayed, game.previousTimes);
    const simpleSudoku = cellsToSimpleSudoku(sudoku);
    const solved = solve(simpleSudoku);
    if (solved.sudoku) {
      setSudoku(simpleSudoku, solved.sudoku);
    }
    continueGame();
  }, [game, restartGame, setSudoku, continueGame]);

  return (
    <div className="relative min-h-full max-w-full">
      <Container>
        <div>
          <Shortcuts gameState={game.state} />
          <header className="flex justify-between sm:items-center mt-4">
            <div className="flex text-white flex-col sm:flex-row justify-end">
              <DifficultyShow>{`${game.difficulty} #${game.sudokuIndex + 1}`}</DifficultyShow>
              <div className="hidden sm:block w-2 sm:w-4" />
              <div className="hidden sm:block">{"|"}</div>
              <div className="hidden sm:block w-2 sm:w-4" />
              <GameTimer />
            </div>
            <div className="text-white text-lg sm:text-2xl font-bold">Super Sudoku</div>
            <div className="flex">
              <div className="flex gap-2 flex-col justify-end items-end sm:flex-row">
                <div className="flex gap-2">
                  <ToggleDarkModeButton />
                  <ClearGameButton />
                </div>
                <div className="flex gap-2">
                  <PauseButton state={game.state} continueGame={continueGame} pauseGame={pauseGame} />
                  <NewGameButton />
                </div>
              </div>
            </div>
          </header>
          <div className="flex gap-4 flex-col md:flex-row">
            <main className="mt-4 flex-grow md:min-w-96 w-full">
              <Sudoku
                sudokuIndex={game.sudokuIndex}
                difficulty={game.difficulty}
                secondsPlayed={game.secondsPlayed}
                previousTimes={game.previousTimes}
                state={game.state}
                showWrongEntries={game.showWrongEntries}
                showConflicts={game.showConflicts}
                notesMode={game.notesMode}
                shouldShowMenu={game.showMenu && game.showCircleMenu}
                sudoku={sudoku}
                timesSolved={game.timesSolved}
                restartGame={handleRestartGame}
                showMenu={showMenu}
                hideMenu={hideMenu}
                selectCell={selectCell}
                showHints={game.showHints && game.state === GameStateMachine.running}
                activeCell={activeCell}
              >
                <CenteredContinueButton visible={pausedGame} onClick={continueGame} />
              </Sudoku>
            </main>
            <div className="mt-4">
              <SudokuMenuNumbersConnected />
              <SudokuMenuControls />
              <div className="text-white">
                <div className="mt-4 grid gap-4">
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
                      <Checkbox
                        id="highlight_wrong_entries"
                        checked={game.showWrongEntries}
                        onChange={toggleShowWrongEntries}
                      >
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
                      This sudoku app is and will be free of charge, free of ads and free of tracking. Its source code
                      is available at{" "}
                      <a target="_blank" className="underline" href="https://github.com/TN1ck/super-sudoku">
                        Github
                      </a>
                      .{" "}
                      <a href="https://tn1ck.com" target="_blank" className="hover:underline">
                        {"Created by Tom Nick."}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

const GameWithRouteManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {setGameState, state: gameState, continueGame, newGame} = useGame();
  const {setSudokuState, state: sudokuState, setSudoku} = useSudoku();
  const search = location.search;
  const sudokuIndex = search["sudokuIndex"] as number;
  const sudoku = search["sudoku"] as string;
  const difficulty = search["difficulty"] as DIFFICULTY;

  React.useEffect(() => {
    if (sudokuIndex && sudoku && difficulty) {
      const simpleSudoku = cellsToSimpleSudoku(sudokuState.current);
      // Only show the check if they actually played a few seconds.
      if (stringifySudoku(simpleSudoku) !== sudoku && gameState.secondsPlayed > 5) {
        const areYouSure = confirm(
          `
The URL contains another sudoku than the one you are currently playing.
Do you want to continue with the new sudoku? The old sudoku will be paused.

You currently play the ${gameState.difficulty} sudoku #${gameState.sudokuIndex + 1}.
The URL contains the ${difficulty} sudoku #${sudokuIndex + 1}.
          `,
        );
        if (!areYouSure) {
          navigate({to: "/"});
          return;
        }
      }

      const localState = getState();
      const storedSudoku = localState.sudokus[sudoku] as StoredSudokuState | undefined;

      const parsedSudoku = parseSudoku(sudoku);
      const solvedSudoku = solve(parsedSudoku);
      if (solvedSudoku.sudoku) {
        setSudoku(parsedSudoku, solvedSudoku.sudoku);
      } else {
        alert("The URL contains an invalid sudoku.");
        return;
      }
      newGame(sudokuIndex, difficulty);

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
    }
  }, [sudokuIndex, sudoku, difficulty, setGameState]);

  return <Game />;
};

export default GameWithRouteManagement;
