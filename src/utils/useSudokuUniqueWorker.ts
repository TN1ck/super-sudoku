import {useCallback, useEffect, useRef, useState} from "react";
import {SimpleSudoku} from "../lib/engine/types";

interface WorkerMessage {
  id: string;
  isUnique: boolean;
  error: string | null;
}

export function useSudokuUniqueWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{isUnique: boolean; error?: string} | null>(null);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(new URL("../workers/sudoku-unique.worker.ts", import.meta.url), {type: "module"});

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const checkUniqueness = useCallback((sudoku: SimpleSudoku): Promise<{isUnique: boolean; error?: string}> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve({isUnique: false, error: "Worker not initialized"});
        return;
      }

      setIsChecking(true);
      setResult(null);

      const id = Math.random().toString(36).substr(2, 9);

      const handleMessage = (event: MessageEvent<WorkerMessage>) => {
        const {id: messageId, isUnique, error} = event.data;

        if (messageId === id) {
          workerRef.current?.removeEventListener("message", handleMessage);
          setIsChecking(false);
          const result = {isUnique, error: error || undefined};
          setResult(result);
          resolve(result);
        }
      };

      workerRef.current.addEventListener("message", handleMessage);
      workerRef.current.postMessage({sudoku, id});
    });
  }, []);

  return {
    checkUniqueness,
    isChecking,
    result,
  };
}
