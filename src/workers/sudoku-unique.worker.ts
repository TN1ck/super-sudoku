import {isSudokuUnique} from "../lib/engine/generate";

// Worker message handler
self.onmessage = (event) => {
  const {sudoku, id} = event.data;

  try {
    const isUnique = isSudokuUnique(sudoku);
    self.postMessage({
      id,
      isUnique,
      error: null,
    });
  } catch (error) {
    self.postMessage({
      id,
      isUnique: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
