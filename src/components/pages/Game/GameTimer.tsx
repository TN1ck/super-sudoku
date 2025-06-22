import * as React from "react";
import {throttle} from "lodash";
import {useGame, GameStateMachine} from "src/context/GameContext";
import {formatDuration} from "src/utils/format";

const GameTimer: React.FC = () => {
  const {state, updateTimer} = useGame();
  const {secondsPlayed, state: gameState, sudokuId} = state;

  const _isMountedRef = React.useRef<boolean>(false);
  const _startTimeRef = React.useRef<number>(0);
  const _sudokuIdRef = React.useRef<number>(-1);
  const _stateRef = React.useRef<GameStateMachine>(GameStateMachine.paused);

  React.useEffect(() => {
    const seconds = secondsPlayed;
    _startTimeRef.current = Number(new Date()) - seconds * 1000;
    _isMountedRef.current = true;
    _sudokuIdRef.current = sudokuId;
    _stateRef.current = gameState;

    const timer = throttle(() => {
      requestAnimationFrame(() => {
        const now = Number(new Date());
        if (
          gameState !== GameStateMachine.running ||
          _sudokuIdRef.current !== sudokuId ||
          _stateRef.current !== gameState
        ) {
          _startTimeRef.current = now - secondsPlayed * 1000;
          _sudokuIdRef.current = sudokuId;
          _stateRef.current = gameState;
        }
        if (gameState === GameStateMachine.running) {
          const diff = now - _startTimeRef.current;
          const seconds = diff / 1000;
          updateTimer(seconds);
        }
        if (_isMountedRef.current) {
          timer();
        }
      });
    }, 2000);

    // timer();

    return () => {
      _isMountedRef.current = false;
    };
  }, [gameState, sudokuId, secondsPlayed, updateTimer]);

  return <div className="text-center text-white">{formatDuration(secondsPlayed)}</div>;
};

export default GameTimer;
