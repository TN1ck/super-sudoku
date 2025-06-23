import * as React from "react";
import {useGame} from "src/context/GameContext";
import {useTimer} from "src/context/TimerContext";
import {formatDuration} from "src/utils/format";

const GameTimer: React.FC = () => {
  const {displayTime} = useTimer();

  return <div>{formatDuration(displayTime)}</div>;
};

export default GameTimer;
