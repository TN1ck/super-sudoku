import * as React from "react";
import {connect, ConnectedProps} from "react-redux";
import Button from "./Button";
import {continueGame, GameStateMachine, pauseGame, resetGame} from "src/state/game";
import {chooseGame} from "src/state/application";
import {RootState} from "src/state/rootReducer";
import {setSudoku} from "src/state/sudoku";
import SUDOKUS from "src/sudoku-game/sudokus";

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
  const pauseAndChoose = () => {
    pauseGame();
    chooseGame();
  };

  return (
    <Button className="bg-teal-600 text-white" onClick={pauseAndChoose}>
      {"New"}
    </Button>
  );
};

const ConnectedNewGameButton = newGameConnector(NewGameButton);

const Header = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className="flex justify-center bg-gray-900 dark:bg-black py-4 text-white">
      <div className="flex justify-between items-center max-w-screen-xl w-full px-4">
        <div>{"Super Sudoku"}</div>
        <div className="flex space-x-2">
          <button onClick={toggleDarkMode}>{darkMode ? "Light Mode" : "Dark Mode"}</button>
          <ConnectedClearGameButton />
          <ConnectedNewGameButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
