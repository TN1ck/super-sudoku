import {RefObject, useEffect, useState} from "react";

export function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [elementWidth, setElementWidth] = useState<number>();

  useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      window.requestAnimationFrame(() => {
        setElementWidth(entry!.contentRect.width);
      });
    });

    const element = ref.current;

    if (element) {
      resizeObserver.observe(element);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return elementWidth;
}
