import * as React from "react";
import GameSelect from "./Game/GameSelect";
import {Container} from "src/components/Layout";
import Button from "../components/Button";
import {useGame} from "src/context/GameContext";
import {useNavigate} from "@tanstack/react-router";
import {DIFFICULTY} from "src/lib/engine/types";
import {cellsToSimpleSudoku, stringifySudoku} from "src/lib/engine/utility";
import {emptyGrid, useSudoku} from "src/context/SudokuContext";

const NewGame = () => {
  const navigate = useNavigate();
  const {continueGame, state} = useGame();
  const {state: sudokuState} = useSudoku();
  const goBack = () => {
    const simpleSudoku = cellsToSimpleSudoku(sudokuState.current);
    navigate({
      to: "/",
      search: {
        sudokuIndex: state.sudokuIndex,
        sudoku: stringifySudoku(simpleSudoku),
        difficulty: state.difficulty,
      },
    });
    continueGame();
  };

  return (
    <Container className="mt-4">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex gap-4 items-center justify-between">
          <h1 className="text-2xl text-white">{"New Game"}</h1>
          <Button className="bg-teal-600 dark:bg-teal-600 text-white flex-shrink-0" onClick={goBack}>
            {"◀ Go back"}
          </Button>
        </div>
        <p className="text-gray-300">{"Choose a new sudoku to play or continue with an already started game."}</p>
      </div>
      <GameSelect />
    </Container>
  );
};

export default NewGame;
