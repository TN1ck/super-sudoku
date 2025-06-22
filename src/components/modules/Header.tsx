import * as React from "react";
import {connect, ConnectedProps} from "react-redux";
import Button from "./Button";
import {continueGame, GameStateMachine, pauseGame, resetGame} from "src/state/game";
import {chooseGame} from "src/state/application";
import {RootState} from "src/state/rootReducer";
import {setSudoku} from "src/state/sudoku";
import SUDOKUS from "src/sudoku-game/sudokus";
import {Link, useNavigate} from "@tanstack/react-location";

const newGameConnector = connect(null, {
  pauseGame,
  chooseGame,
});

type NewGamePropsFromRedux = ConnectedProps<typeof newGameConnector>;

const clearGameConnector = connect(
  (state: RootState) => ({
    state: state.game.state,
    difficulty: state.game.difficulty as keyof typeof SUDOKUS,
    sudokuIndex: state.game.sudokuIndex,
  }),
  {
    setSudoku,
    resetGame,
    pauseGame,
    continueGame,
  },
);

type ClearGamePropsFromRedux = ConnectedProps<typeof clearGameConnector>;

const ClearGameButton: React.FC<ClearGamePropsFromRedux> = ({
  state,
  difficulty,
  sudokuIndex,
  setSudoku,
  resetGame,
  pauseGame,
  continueGame,
}) => {
  const clearGame = async () => {
    pauseGame();
    // Wait 50ms to make sure the game is shown as paused when in the confirm dialog.
    await new Promise((resolve) => setTimeout(resolve, 30));
    const areYouSure = confirm("Are you sure? This will clear the sudoku and reset the timer.");
    if (!areYouSure) {
      continueGame();
      return;
    }
    const sudoku = SUDOKUS[difficulty][sudokuIndex];
    setSudoku(sudoku.sudoku, sudoku.solution);
    resetGame();
    // Wait 100ms as we have to wait until the updateTimer is called (should normally take 1/60 second)
    // This is certainly not ideal and should be fixed there.
    await new Promise((resolve) => setTimeout(resolve, 100));
    continueGame();
  };

  return (
    <Button disabled={state === GameStateMachine.wonGame || state === GameStateMachine.paused} onClick={clearGame}>
      {"Clear"}
    </Button>
  );
};

const ConnectedClearGameButton = clearGameConnector(ClearGameButton);

const NewGameButton: React.FC<NewGamePropsFromRedux> = ({pauseGame, chooseGame}) => {
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

const ConnectedNewGameButton = newGameConnector(NewGameButton);

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
        <path
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          fill-rule="evenodd"
          clip-rule="evenodd"
        ></path>
      </svg>
    </button>
  );
};

const Header = () => {
  return (
    <div className="flex justify-center bg-gray-900 dark:bg-black py-4 text-white">
      <div className="flex justify-between items-center max-w-screen-xl w-full px-4">
        <div>{"Super Sudoku"}</div>
        <div className="flex space-x-2">
          <ToggleDarkModeButton />
          <ConnectedClearGameButton />
          <ConnectedNewGameButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
