import { useEffect, useState } from 'react';

/**
 * Window size dimensions
 */
export interface WindowSize {
  width: number;
  height: number;
}

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
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handler = () => {
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

