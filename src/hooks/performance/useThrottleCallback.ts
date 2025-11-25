import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook that throttles a callback function
 *
 * @template T - The callback function type
 * @param callback - The callback function to throttle
 * @param delay - Throttle delay in milliseconds (default: 500)
 * @returns The throttled callback function
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const handleScroll = useThrottleCallback(() => {
 *     console.log('Scrolled');
 *   }, 100);
 *
 *   return <div onScroll={handleScroll}>Content</div>;
 * };
 * ```
 */
export function useThrottleCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRunRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callbackRef.current(...args);
        }, delay - (now - lastRunRef.current));
      }
    },
    [delay]
  );
}

