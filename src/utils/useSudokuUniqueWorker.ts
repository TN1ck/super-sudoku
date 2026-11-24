import {useCallback, useEffect, useRef, useState} from "react";
import {SimpleSudoku} from "../lib/engine/types";

interface WorkerMessage {
  id: number;
  isUnique: boolean;
  error: string | null;
}

export interface UniquenessResult {
  isUnique: boolean;
  error?: string;
}

export function useSudokuUniqueWorker() {
  const workerRef = useRef<Worker | null>(null);
  const nextIdRef = useRef(0);
  const latestIdRef = useRef(0);
  const pendingRef = useRef(new Map<number, (result: UniquenessResult) => void>());
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<UniquenessResult | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/sudoku-unique.worker.ts", import.meta.url), {type: "module"});
    workerRef.current = worker;
    const pending = pendingRef.current;

    const settlePendingWithError = (errorMessage: string) => {
      for (const [id, resolve] of pending.entries()) {
        pending.delete(id);
        resolve({isUnique: false, error: errorMessage});
      }
      setIsChecking(false);
      setResult({isUnique: false, error: errorMessage});
    };

    const handleMessage = (event: MessageEvent<WorkerMessage>) => {
      const {id, isUnique, error} = event.data;
      const resolve = pending.get(id);
      if (!resolve) {
        return;
      }
      pending.delete(id);
      const outcome: UniquenessResult = {isUnique, error: error || undefined};
      if (id === latestIdRef.current) {
        setIsChecking(false);
        setResult(outcome);
      }
      resolve(outcome);
    };

    const handleError = (event: ErrorEvent) => {
      settlePendingWithError(event.message || "Worker error");
    };

    const handleMessageError = () => {
      settlePendingWithError("Worker message error");
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);
    worker.addEventListener("messageerror", handleMessageError);

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      worker.removeEventListener("messageerror", handleMessageError);
      worker.terminate();
      workerRef.current = null;
      for (const [id, resolve] of pending.entries()) {
        pending.delete(id);
        resolve({isUnique: false, error: "Worker terminated"});
      }
    };
  }, []);

  const checkUniqueness = useCallback((sudoku: SimpleSudoku): Promise<UniquenessResult> => {
    return new Promise((resolve) => {
      const worker = workerRef.current;
      if (!worker) {
        resolve({isUnique: false, error: "Worker not initialized"});
        return;
      }

      const id = ++nextIdRef.current;
      latestIdRef.current = id;
      pendingRef.current.set(id, resolve);
      setIsChecking(true);
      setResult(null);

      worker.postMessage({sudoku, id});
    });
  }, []);

  return {
    checkUniqueness,
    isChecking,
    result,
  };
}
