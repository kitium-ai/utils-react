import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook that debounces a callback function
 *
 * @template T - The callback function type
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns The debounced callback function
 *
 * @example
 * ```tsx
 * const SearchForm = () => {
 *   const handleSearch = useDebounceCallback((query: string) => {
 *     console.log('Searching for:', query);
 *   }, 300);
 *
 *   return <input onChange={(e) => handleSearch(e.target.value)} />;
 * };
 * ```
 */
export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
