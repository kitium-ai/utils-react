import { useCallback, useState } from 'react';

/**
 * Options for useCounter hook
 */
export type UseCounterOptions = {
  min?: number;
  max?: number;
  step?: number;
};

/**
 * Hook for managing counter state with increment/decrement
 *
 * @param initialValue - Initial counter value (default: 0)
 * @param options - Counter options (min, max, step)
 * @returns Tuple of [count, { increment, decrement, reset, setCount }]
 *
 * @example
 * ```tsx
 * const Counter = () => {
 *   const [count, { increment, decrement, reset }] = useCounter(0, { min: 0, max: 10 });
 *   return (
 *     <div>
 *       <button onClick={decrement}>-</button>
 *       <span>{count}</span>
 *       <button onClick={increment}>+</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * };
 * ```
 */
export function useCounter(
  initialValue = 0,
  options: UseCounterOptions = {}
): [
  number,
  {
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    setCount: (value: number | ((previous: number) => number)) => void;
  },
] {
  const { min = -Infinity, max = Infinity, step = 1 } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((c) => Math.min(c + step, max));
  }, [max, step]);

  const decrement = useCallback(() => {
    setCount((c) => Math.max(c - step, min));
  }, [min, step]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return [count, { increment, decrement, reset, setCount }];
}
