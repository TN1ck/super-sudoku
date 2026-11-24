import {RefObject, useEffect, useRef, useState} from "react";

export function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [elementWidth, setElementWidth] = useState<number>();
  const frameIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      if (frameIdRef.current !== undefined) {
        window.cancelAnimationFrame(frameIdRef.current);
      }
      frameIdRef.current = window.requestAnimationFrame(() => {
        frameIdRef.current = undefined;
        setElementWidth(entry.contentRect.width);
      });
    });

    resizeObserver.observe(element);

    return () => {
      if (frameIdRef.current !== undefined) {
        window.cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = undefined;
      }
      resizeObserver.disconnect();
    };
  }, [ref]);

  return elementWidth;
}
