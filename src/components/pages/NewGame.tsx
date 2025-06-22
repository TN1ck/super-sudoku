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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white">{"New Game"}</h1>
          <p className="text-gray-300">{"Choose a new sudoku to play or continue with an already started game."}</p>
        </div>
        <Button className="bg-teal-600 dark:bg-teal-600 text-white" onClick={goBack}>
          {"◀ Go back"}
        </Button>
      </div>
      <GameSelect />
    </Container>
  );
};

export default NewGame;
