import { useEffect, useRef } from 'react';

/**
 * Hook that returns the previous value of a variable
 *
 * @template T - The type of the value
 * @param value - The current value
 * @returns The previous value
 *
 * @example
 * ```tsx
 * const Counter = () => {
 *   const [count, setCount] = useState(0);
 *   const prevCount = usePrevious(count);
 *   return <div>Now: {count}, Before: {prevCount}</div>;
 * };
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
