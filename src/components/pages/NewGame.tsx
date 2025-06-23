import * as React from "react";
import GameSelect from "./Game/GameSelect";
import {Container} from "src/components/modules/Layout";
import Button from "../modules/Button";
import {useNavigate} from "@tanstack/react-location";
import {useGame} from "src/context/GameContext";

const NewGame = () => {
  const navigate = useNavigate();
  const {continueGame} = useGame();
  const goBack = () => {
    navigate({to: "/", replace: true});
    continueGame();
  };

  return (
    <Container className="mt-8">
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
