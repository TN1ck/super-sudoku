import {RefObject, useEffect, useState} from "react";

export function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [elementWidth, setElementWidth] = useState<number>();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    let frameId: number | undefined;
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = undefined;
        setElementWidth(entry.contentRect.width);
      });
    });

    resizeObserver.observe(element);

    return () => {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
    };
  }, [ref]);

  return elementWidth;
}
