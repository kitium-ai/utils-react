import { useEffect, useState } from 'react';

/**
 * Hook that throttles a value
 *
 * @template T - The type of the value
 * @param value - The value to throttle
 * @param delay - Throttle delay in milliseconds (default: 500)
 * @returns The throttled value
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [scrollY, setScrollY] = useState(0);
 *   const throttledScrollY = useThrottle(scrollY, 100);
 *
 *   useEffect(() => {
 *     const handler = () => setScrollY(window.scrollY);
 *     window.addEventListener('scroll', handler);
 *     return () => window.removeEventListener('scroll', handler);
 *   }, []);
 *
 *   return <div>Throttled: {throttledScrollY}</div>;
 * };
 * ```
 */
export function useThrottle<T>(value: T, delay = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}
