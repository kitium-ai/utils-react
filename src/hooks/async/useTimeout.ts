import { useEffect, useRef } from 'react';

/**
 * Hook that runs a callback after a specified delay
 *
 * @param callback - Function to call after delay
 * @param delay - Delay in milliseconds (null to cancel)
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [show, setShow] = useState(false);
 *   useTimeout(() => setShow(true), 1000);
 *   return <div>{show ? 'Shown' : 'Hidden'}</div>;
 * };
 * ```
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);
}
