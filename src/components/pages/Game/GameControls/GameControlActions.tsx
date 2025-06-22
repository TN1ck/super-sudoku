import * as React from "react";
import {GameStateMachine} from "src/context/GameContext";
import {useGame} from "src/context/GameContext";
import {useSudoku} from "src/context/SudokuContext";
import Button from "../../../modules/Button";
import clsx from "clsx";

const ControlContainer = ({children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="relative justify-center flex" {...props}>
    {children}
  </div>
);

const UndoButton: React.FC = () => {
  const {state: gameState} = useGame();
  const {state: sudokuState, undo} = useSudoku();

  const canUndo = sudokuState.historyIndex < sudokuState.history.length - 1;

  return (
    <Button
      className="w-full"
      disabled={gameState.state === GameStateMachine.wonGame || gameState.state === GameStateMachine.paused || !canUndo}
      onClick={undo}
    >
      {"Undo"}
    </Button>
  );
};

const SudokuMenuControls: React.FC = () => {
  const {state: gameState, activateNotesMode, deactivateNotesMode} = useGame();
  const {clearCell, getHint} = useSudoku();

  const {notesMode, activeCellCoordinates} = gameState;

  return (
    <div className="mt-4 grid w-full grid-cols-4 gap-2">
      <ControlContainer>
        <UndoButton />
      </ControlContainer>
      <ControlContainer>
        <Button className="w-full" onClick={() => activeCellCoordinates && clearCell(activeCellCoordinates)}>
          {"Erase"}
        </Button>
      </ControlContainer>
      <ControlContainer>
        <Button
          onClick={() => (notesMode ? deactivateNotesMode() : activateNotesMode())}
          className={clsx("w-full relative")}
        >
          <div
            className={clsx("absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full px-2 text-sm md:text-base", {
              "bg-teal-700 text-white": !notesMode,
              "bg-sky-700 text-white": notesMode,
            })}
          >{`${notesMode ? "ON" : "OFF"}`}</div>
          <div>{"Notes"}</div>
        </Button>
      </ControlContainer>
      <ControlContainer>
        <Button className="w-full" onClick={() => activeCellCoordinates && getHint(activeCellCoordinates)}>
          {"Hint"}
        </Button>
      </ControlContainer>
    </div>
  );
};

export default SudokuMenuControls;
