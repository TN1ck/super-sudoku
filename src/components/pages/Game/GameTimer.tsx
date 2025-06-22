import * as React from "react";
import {useGame} from "src/context/GameContext";
import {useTimer} from "src/context/TimerContext";
import {formatDuration} from "src/utils/format";

const GameTimer: React.FC = () => {
  const {state} = useGame();
  const {displayTime} = useTimer();

  return <div className="text-center text-white">{formatDuration(displayTime)}</div>;
};

export default GameTimer;
