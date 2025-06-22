import React, {createContext, useContext, useRef, useState, useEffect} from "react";
import {GameStateMachine, useGame} from "src/context/GameContext";

interface TimerContextType {
  displayTime: number;
  isRunning: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({children}: {children: React.ReactNode}) {
  const {state, updateTimer} = useGame();
  const {secondsPlayed, state: gameState} = state;

  const [displayTime, setDisplayTime] = useState(secondsPlayed);
  const startTimeRef = useRef<number>(0);
  const lastPersistedRef = useRef<number>(0);
  const isRunning = gameState === GameStateMachine.running;

  useEffect(() => {
    startTimeRef.current = Date.now() - secondsPlayed * 1000;
    setDisplayTime(secondsPlayed);
    lastPersistedRef.current = Math.floor(secondsPlayed);
  }, [secondsPlayed, gameState]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setDisplayTime(elapsed);

      // Update game state every second for persistence
      const currentSecond = Math.floor(elapsed);
      if (currentSecond > lastPersistedRef.current) {
        updateTimer(elapsed);
        lastPersistedRef.current = currentSecond;
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, updateTimer]);

  return <TimerContext.Provider value={{displayTime, isRunning}}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within TimerProvider");
  return context;
}
