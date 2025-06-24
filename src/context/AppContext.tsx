import React, {useEffect, ReactNode} from "react";
import {GameProvider, GameState, INITIAL_GAME_STATE, useGame} from "./GameContext";
import {SudokuProvider, SudokuState, INITIAL_SUDOKU_STATE, useSudoku} from "./SudokuContext";
import {TimerProvider} from "./TimerContext";
import {getState} from "src/lib/game/persistence";
import {saveToLocalStorage} from "src/lib/game/persistence";
import throttle from "lodash/throttle";

interface AppContextProps {
  children: ReactNode;
}

// Save every 2 seconds.
const throttledSave = throttle(saveToLocalStorage, 2000);

export function AppProvider({children}: AppContextProps) {
  // Load initial state from persistence
  const savedState = getState();
  const currentSudoku = savedState.sudokus[savedState.active];

  const initialGameState: GameState = currentSudoku ? currentSudoku.game : INITIAL_GAME_STATE;

  const initialSudokuState: SudokuState = currentSudoku
    ? {
        history: [currentSudoku.sudoku],
        historyIndex: 0,
        current: currentSudoku.sudoku,
      }
    : INITIAL_SUDOKU_STATE;

  return (
    <GameProvider initialState={initialGameState}>
      <TimerProvider>
        <SudokuProvider initialState={initialSudokuState}>
          <PersistenceHandler>{children}</PersistenceHandler>
        </SudokuProvider>
      </TimerProvider>
    </GameProvider>
  );
}

// Component to handle persistence
function PersistenceHandler({children}: {children: ReactNode}) {
  const {state: gameState} = useGame();
  const {state: sudokuState} = useSudoku();

  useEffect(() => {
    if (gameState && sudokuState) {
      throttledSave(gameState, sudokuState);
    }
  }, [gameState, sudokuState]);

  return <>{children}</>;
}
