import * as React from "react";
import GameSelect from "./Game/GameSelect";

const NewGame = () => {
  return (
    <div className="m-auto max-w-screen-md md:max-w-screen-lg p-4">
      <h1 className="text-2xl text-white">{"New Game"}</h1>
      <GameSelect />
    </div>
  );
};

export default NewGame;
