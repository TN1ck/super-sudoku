import * as React from "react";
import GameSelect from "./Game/GameSelect";
import {Container} from "src/components/modules/Layout";

const NewGame = () => {
  return (
    <Container className="mt-8">
      <h1 className="text-2xl text-white">{"New Game"}</h1>
      <p className="text-gray-300">{"Choose a new sudoku to play or continue with an already started game."}</p>
      <GameSelect />
    </Container>
  );
};

export default NewGame;
