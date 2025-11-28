import { useEffect, useRef } from 'react';

/**
 * Hook that runs a callback at a specified interval
 *
 * @param callback - Function to call on each interval
 * @param delay - Delay in milliseconds (null to pause)
 *
 * @example
 * ```tsx
 * const Timer = () => {
 *   const [count, setCount] = useState(0);
 *   useInterval(() => setCount(c => c + 1), 1000);
 *   return <div>{count}</div>;
 * };
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}
