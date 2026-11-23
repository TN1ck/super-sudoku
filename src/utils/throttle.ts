export interface ThrottledFunction<Args extends unknown[]> {
  (...args: Args): void;
  flush: () => void;
  cancel: () => void;
}

/**
 * Leading + trailing throttle with flush() and cancel().
 */
export function throttle<Args extends unknown[]>(fn: (...args: Args) => void, waitMs: number): ThrottledFunction<Args> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastCallTime: number | undefined;
  let pendingArgs: Args | undefined;

  const invoke = (args: Args) => {
    lastCallTime = Date.now();
    pendingArgs = undefined;
    fn(...args);
  };

  const scheduleTrailing = (delay: number) => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = undefined;
      if (pendingArgs !== undefined) {
        invoke(pendingArgs);
      }
    }, delay);
  };

  const throttled = (...args: Args) => {
    const now = Date.now();
    const elapsed = lastCallTime === undefined ? waitMs : now - lastCallTime;
    const remaining = waitMs - elapsed;

    if (remaining <= 0 || remaining > waitMs) {
      if (timerId !== undefined) {
        clearTimeout(timerId);
        timerId = undefined;
      }
      invoke(args);
    } else {
      pendingArgs = args;
      if (timerId === undefined) {
        scheduleTrailing(remaining);
      }
    }
  };

  throttled.flush = () => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
    if (pendingArgs !== undefined) {
      invoke(pendingArgs);
    }
  };

  throttled.cancel = () => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
    pendingArgs = undefined;
    lastCallTime = undefined;
  };

  return throttled;
}
