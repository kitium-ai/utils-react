import { useEffect, useState } from 'react';

/**
 * Scroll position
 */
export type ScrollPosition = {
  x: number;
  y: number;
};

/**
 * Hook that tracks window scroll position
 *
 * @returns Current scroll position
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const { x, y } = useWindowScroll();
 *   return <div>Scroll: {x}, {y}</div>;
 * };
 * ```
 */
export function useWindowScroll(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>(() => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }
    return {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handler = (): void => {
      setPosition({
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset,
      });
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return position;
}
