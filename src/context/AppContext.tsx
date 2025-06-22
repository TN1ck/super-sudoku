import React, {useEffect, ReactNode} from "react";
import {GameProvider, GameState, INITIAL_GAME_STATE, useGame} from "./GameContext";
import {SudokuProvider, SudokuState, INITIAL_SUDOKU_STATE, useSudoku} from "./SudokuContext";
import {getState} from "src/sudoku-game/persistence";
import {saveToLocalStorage} from "src/sudoku-game/persistence";
import {throttle} from "lodash";

interface AppContextProps {
  children: ReactNode;
}

const throttledSave = throttle(saveToLocalStorage, 1000);

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
      <SudokuProvider initialState={initialSudokuState}>
        <PersistenceHandler>{children}</PersistenceHandler>
      </SudokuProvider>
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
