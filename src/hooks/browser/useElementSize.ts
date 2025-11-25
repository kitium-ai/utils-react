import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Element size dimensions
 */
export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Hook that tracks the size of an element
 *
 * @template T - The type of the HTML element
 * @param ref - Ref object attached to the element
 * @returns Current element dimensions
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { width, height } = useElementSize(ref);
 *   return <div ref={ref}>Size: {width}x{height}</div>;
 * };
 * ```
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>
): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}

