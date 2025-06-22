import * as React from "react";

import {connect, ConnectedProps} from "react-redux";
import {
  pauseGame,
  continueGame,
  wonGame,
  hideMenu,
  showMenu,
  selectCell,
  restartGame,
  GameStateMachine,
  toggleShowHints,
  toggleShowCircleMenu,
  toggleShowWrongEntries,
  toggleShowConflicts,
  toggleShowOccurrences,
} from "src/state/game";

import {chooseGame} from "src/state/application";

import {setNumber, setNotes, setSudoku, undo} from "src/state/sudoku";

import {Sudoku} from "src/components/pages/Game/Sudoku/Sudoku";

import GameTimer from "./Game/GameTimer";

import Button from "src/components/modules/Button";
import {RootState} from "src/state/rootReducer";
import SudokuGame from "src/sudoku-game/SudokuGame";
import SudokuMenuNumbers from "src/components/pages/Game/GameControls/GameControlNumbers";
import SudokuMenuControls from "src/components/pages/Game/GameControls/GameControlActions";
import {Container} from "src/components/modules/Layout";
import Shortcuts from "./Game/shortcuts/Shortcuts";
import Checkbox from "src/components/modules/Checkbox";
import SUDOKUS from "src/sudoku-game/sudokus";

const sudokuMenuNumbersConnector = connect(
  (state: RootState) => ({
    notesMode: state.game.notesMode,
    activeCell: state.game.activeCellCoordinates,
  }),
  {
    setNumber,
    setNotes,
  },
);
const SudokuMenuNumbersConnected = sudokuMenuNumbersConnector(SudokuMenuNumbers);

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

const connector = connect(
  (state: RootState) => {
    return {
      game: state.game,
      application: state.application,
      sudoku: state.sudoku.current,
    };
  },
  {
    continueGame,
    pauseGame,
    chooseGame,
    wonGame,
    showMenu,
    restartGame,
    setSudoku,
    selectCell,
    hideMenu,
    toggleShowHints,
    toggleShowOccurrences,
    toggleShowCircleMenu,
    toggleShowWrongEntries,
    toggleShowConflicts,
  },
);

type PropsFromRedux = ConnectedProps<typeof connector>;

class Game extends React.Component<PropsFromRedux> {
  componentDidUpdate(prevProps: PropsFromRedux) {
    // check if won
    const wasSolved = SudokuGame.isSolved(prevProps.sudoku);
    const isSolved = SudokuGame.isSolved(this.props.sudoku);
    if (isSolved && !wasSolved) {
      this.props.wonGame();
    }
  }

  componentDidMount() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibilityChange, false);
      document.addEventListener("visibilitychange", this.onVisibilityChange, false);
    }
  }

  componentWillUnmount() {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibilityChange, false);
    }
  }

  onVisibilityChange = () => {
    setTimeout(() => {
      if (document.visibilityState === "hidden") {
        this.props.pauseGame();
      } else if (this.props.game.state === GameStateMachine.paused) {
        this.props.continueGame();
      }
      // TODO: THere is some caching somewhere that breaks this.
    }, 500);
  };

  render() {
    const {game, application, pauseGame, continueGame, chooseGame, sudoku} = this.props;
    const pausedGame = game.state === GameStateMachine.paused;
    const activeCell = game.activeCellCoordinates
      ? sudoku.find((s) => {
          return s.x === game.activeCellCoordinates!.x && s.y === game.activeCellCoordinates!.y;
        })
      : undefined;

    const restartGame = () => {
      () => {
        this.props.restartGame(
          this.props.game.sudokuId,
          this.props.game.sudokuIndex,
          this.props.game.difficulty,
          this.props.game.timesSolved,
          this.props.game.secondsPlayed,
          this.props.game.previousTimes,
        );
        // Could also recreate it from this.props.sudoku.
        const sudoku = SUDOKUS[this.props.game.difficulty][this.props.game.sudokuIndex];
        this.props.setSudoku(sudoku.sudoku, sudoku.solution);
        this.props.continueGame();
      };
    };

    return (
      <div className="relative min-h-full max-w-full">
        <Container>
          <div>
            <Shortcuts gameState={game.state} applicationState={application.state} />
            <header className="flex justify-between items-center mt-4">
              <div className="flex">
                <DifficultyShow>{`${game.difficulty} - ${game.sudokuIndex + 1}`}</DifficultyShow>
                <div className="w-2 sm:w-4" />
                {"|"}
                <div className="w-2 sm:w-4" />
                <GameTimer />
              </div>
              <div className="flex">
                <div>
                  <PauseButton state={game.state} continueGame={continueGame} pauseGame={pauseGame} />
                </div>
              </div>
            </header>
            <div className="flex gap-4 flex-col md:flex-row">
              <main className="mt-4 flex-grow md:min-w-96 w-full ">
                <CenteredContinueButton visible={pausedGame} onClick={continueGame} />
                <Sudoku
                  sudokuId={this.props.game.sudokuId}
                  sudokuIndex={this.props.game.sudokuIndex}
                  difficulty={this.props.game.difficulty}
                  secondsPlayed={this.props.game.secondsPlayed}
                  previousTimes={this.props.game.previousTimes}
                  state={this.props.game.state}
                  showWrongEntries={this.props.game.showWrongEntries}
                  showConflicts={this.props.game.showConflicts}
                  notesMode={this.props.game.notesMode}
                  shouldShowMenu={this.props.game.showMenu && this.props.game.showCircleMenu}
                  sudoku={this.props.sudoku}
                  timesSolved={this.props.game.timesSolved}
                  restartGame={restartGame}
                  showMenu={this.props.showMenu}
                  hideMenu={this.props.hideMenu}
                  selectCell={this.props.selectCell}
                  showHints={game.showHints && game.state === GameStateMachine.running}
                  activeCell={activeCell}
                />
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
                        <Checkbox id="generated_notes" checked={game.showHints} onChange={this.props.toggleShowHints}>
                          {"Show auto generated notes"}
                        </Checkbox>
                        <Checkbox
                          id="highlight_wrong_entries"
                          checked={game.showWrongEntries}
                          onChange={this.props.toggleShowWrongEntries}
                        >
                          {"Highlight wrong entries"}
                        </Checkbox>
                        <Checkbox
                          id="highlight_conflicts"
                          checked={game.showConflicts}
                          onChange={this.props.toggleShowConflicts}
                        >
                          {"Highlight conflicts"}
                        </Checkbox>
                        <Checkbox
                          id="circle_menu"
                          checked={game.showCircleMenu}
                          onChange={this.props.toggleShowCircleMenu}
                        >
                          {"Show circle menu when a cell is clicked (desktop only)"}
                        </Checkbox>
                        <Checkbox
                          id="show_occurrences"
                          checked={game.showOccurrences}
                          onChange={this.props.toggleShowOccurrences}
                        >
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
  }
}

export default connector(Game);
