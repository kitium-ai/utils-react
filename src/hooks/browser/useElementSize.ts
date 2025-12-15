import { type RefObject, useEffect, useRef, useState } from 'react';

/**
 * Element size dimensions
 */
export type ElementSize = {
  width: number;
  height: number;
};

/**
 * Hook that tracks the size of an element
 *
 * @template T - The type of the HTML element
 * @returns Tuple of [ref, size]
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [ref, { width, height }] = useElementSize<HTMLDivElement>();
 *   return <div ref={ref}>Size: {width}x{height}</div>;
 * };
 * ```
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(): [RefObject<T>, ElementSize] {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const reference = useRef<T>(null);

  useEffect(() => {
    const element = reference.current;
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
  }, []);

  return [reference, size];
}
