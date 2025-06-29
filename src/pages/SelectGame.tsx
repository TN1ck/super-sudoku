import * as React from "react";
import GameSelect from "./Game/GameSelect";
import {Container} from "src/components/Layout";
import Button from "../components/Button";
import {useLocation, useNavigate} from "@tanstack/react-router";

const SelectGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search;
  const sudokuIndex = search["sudokuIndex"] as number;
  const sudoku = search["sudoku"] as string;
  const sudokuCollectionName = search["sudokuCollectionName"] as string;

  const goBack = () => {
    navigate({
      to: "/",
      search: {
        sudokuIndex: sudokuIndex,
        sudoku: sudoku,
        sudokuCollectionName: sudokuCollectionName,
      },
    });
  };

  return (
    <Container className="mt-4">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex gap-4 items-center justify-between">
          <h1 className="text-2xl text-white">{"Select Game"}</h1>
          <Button className="bg-teal-600 dark:bg-teal-600 text-white flex-shrink-0" onClick={goBack}>
            {"◀ Go back"}
          </Button>
        </div>
        <p className="text-gray-300">{"Select a new sudoku to play or continue with an already started game."}</p>
      </div>
      <GameSelect />
    </Container>
  );
};

export default SelectGame;
