import * as React from "react";
import {GameStateMachine, useGame} from "src/context/GameContext";
import {formatDuration} from "src/utils/format";

const GameTimer: React.FC<{hidden?: boolean}> = ({hidden = false}) => {
  const {state, updateTimer} = useGame();
  React.useEffect(() => {
    if (state.state !== GameStateMachine.running) {
      return;
    }
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [state.state, updateTimer]);

  if (hidden) {
    return null;
  }

  return <div data-testid="game-timer">{formatDuration(state.secondsPlayed)}</div>;
};

export default GameTimer;
