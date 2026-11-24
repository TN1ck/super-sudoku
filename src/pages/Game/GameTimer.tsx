import * as React from "react";
import {GameStateMachine, useGame} from "src/context/GameContext";
import {formatDuration} from "src/utils/format";

const GameTimer: React.FC = () => {
  const {state, updateTimer} = useGame();
  React.useEffect(() => {
    if (state.state !== GameStateMachine.running) {
      return;
    }
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [state.state, updateTimer]);

  return <div>{formatDuration(state.secondsPlayed)}</div>;
};

export default GameTimer;
