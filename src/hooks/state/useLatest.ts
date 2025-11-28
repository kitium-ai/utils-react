import { useRef } from 'react';

/**
 * Hook that always returns the latest value
 * Useful for accessing the latest value in callbacks without causing re-renders
 *
 * @template T - The type of the value
 * @param value - The value to track
 * @returns A ref object with the latest value
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [count, setCount] = useState(0);
 *   const latestCount = useLatest(count);
 *
 *   useEffect(() => {
 *     const timer = setInterval(() => {
 *       console.log(latestCount.current); // Always gets latest value
 *     }, 1000);
 *     return () => clearInterval(timer);
 *   }, []); // Empty deps, but still gets latest count
 * };
 * ```
 */
export function useLatest<T>(value: T): { readonly current: T } {
  const reference = useRef(value);
  reference.current = value;
  return reference;
}
