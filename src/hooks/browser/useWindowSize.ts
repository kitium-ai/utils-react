import { useEffect, useState } from 'react';

// eslint-disable-next-line no-restricted-imports -- Internal package utility
import { isBrowser } from '../../utils/ssr.js';

/**
 * Window size dimensions
 */
export type WindowSize = {
  width: number;
  height: number;
};

/**
 * Hook that tracks window size
 *
 * @returns Current window dimensions
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const { width, height } = useWindowSize();
 *   return <div>Window: {width}x{height}</div>;
 * };
 * ```
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => {
    if (!isBrowser()) {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const handler = (): void => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return size;
}
