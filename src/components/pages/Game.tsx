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
import GameMenu from "./Game/GameMenu";

import Button from "src/components/modules/Button";
import styled from "styled-components";
import THEME from "src/theme";
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

const ContinueIcon = styled.div.attrs({
  className: "bg-teal-500",
})`
  border-radius: 100%;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 200ms ease-out;

  &:after {
    content: "";
    height: 0;
    width: 0;
    transform: translateX(5px);
    border-style: solid;
    border-width: 20px 0 20px 30px;
    border-color: transparent transparent transparent white;
  }
`;

const CenteredContinueButton = styled.div<{visible: boolean}>`
  display: ${(p) => (p.visible ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 30;

  &:hover {
    cursor: pointer;
    ${ContinueIcon} {
      transform: scale(1.1);
    }
  }
`;

const DifficultyShow = styled.div.attrs({
  className: "text-white capitalize",
})``;

const GameGrid = styled.div.attrs({
  className: "grid justify-center text-white relative pb-4 gap-4 mx-auto",
})`
  grid-template-areas:
    "game-header"
    "game-main"
    "game-controls";
  max-width: ${THEME.responsive.sm}px;
  grid-template-columns: 1fr;
  padding-bottom: 0;

  @media (min-width: ${THEME.responsive.md}px) {
    grid-template-areas:
      "game-header game-header"
      "game-main game-controls"
      "game-main game-controls";
    max-width: 100%;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr auto;
  }
`;

const GameMainArea = styled.div.attrs({
  className: "relative flex flex-wrap shrink-0 grow-0 rounded-sm ",
})`
  grid-area: game-main;
  box-shadow: ${THEME.boxShadow};
  /* Not perfect, but close enough. */
  width: 100%;
  height: calc(100vw - 16px);
  max-width: ${THEME.responsive.sm};
  max-height: ${THEME.responsive.sm};

  @media (min-width: ${THEME.responsive.md}px) {
    width: 500px;
    height: 500px;
  }

  @media (min-width: ${THEME.responsive.lg}px) {
    width: 600px;
    height: 600px;
  }
`;

const GameHeaderArea = styled.div.attrs({
  className: "flex justify-between items-end mt-4",
})`
  grid-area: game-header;
`;

const GameFooterArea = styled.div`
  grid-area: game-controls;
`;

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
        <GameMenu />
        <Container>
          <GameGrid>
            <Shortcuts gameState={game.state} applicationState={application.state} />
            <GameHeaderArea>
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
            </GameHeaderArea>
            <GameMainArea>
              <CenteredContinueButton visible={pausedGame} onClick={continueGame}>
                <ContinueIcon />
              </CenteredContinueButton>
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
            </GameMainArea>
            <GameFooterArea>
              <SudokuMenuNumbersConnected />
              <SudokuMenuControls />
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
                    <Checkbox id="circle_menu" checked={game.showCircleMenu} onChange={this.props.toggleShowCircleMenu}>
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
                    This sudoku app is and will be free of charge, free of ads and free of tracking. Its source code is
                    available at{" "}
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
            </GameFooterArea>
          </GameGrid>
        </Container>
      </div>
    );
  }
}

export default connector(Game);
