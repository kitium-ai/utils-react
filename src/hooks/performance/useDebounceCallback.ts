/**
 * Hook that debounces a callback function
 */

import { createDelayedCallback } from './delayed/createDelayedCallback.js';
import type { AnyCallable, DelayedFunction } from './delayed/types.js';

export type DebounceOptions = {
  /**
   * Delay in milliseconds (default: 500)
   */
  delay?: number;
  /**
   * Invoke the callback on the leading edge instead of trailing (default: false)
   */
  leading?: boolean;
  /**
   * Maximum time the callback can be delayed before being invoked (default: undefined)
   */
  maxWait?: number;
};

/**
 * Debounced function type with cancel, flush, and isPending methods
 */
export type DebouncedFunction<T extends AnyCallable> = DelayedFunction<T>;

/**
 * Hook that debounces a callback function with advanced options
 *
 * @template T - The callback function type
 * @param callback - The callback function to debounce
 * @param options - Debounce configuration options or delay in milliseconds (for backwards compatibility)
 * @returns The debounced callback function with cancel, flush, and isPending methods
 *
 * @example
 * ```tsx
 * const SearchForm = () => {
 *   const handleSearch = useDebounceCallback((query: string) => {
 *     console.log('Searching for:', query);
 *   }, { delay: 300, leading: false, maxWait: 1000 });
 *
 *   return (
 *     <div>
 *       <input onChange={(e) => handleSearch(e.target.value)} />
 *       <button onClick={handleSearch.cancel}>Cancel</button>
 *       <button onClick={handleSearch.flush}>Search Now</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @remarks
 * This hook provides a configurable debounce implementation with:
 * - Leading edge invocation support
 * - Maximum wait time to ensure periodic execution
 * - Cancel and flush methods for manual control
 * - Backwards compatible with simple delay parameter
 */
export function useDebounceCallback<T extends AnyCallable>(
  callback: T,
  options: DebounceOptions | number = 500
): DebouncedFunction<T> {
  // Normalize options
  const normalizedOptions =
    typeof options === 'number'
      ? { delay: options, leading: false, maxWait: Infinity }
      : {
          delay: options.delay ?? 500,
          leading: options.leading ?? false,
          maxWait: options.maxWait ?? Infinity,
        };

  return createDelayedCallback(callback, {
    mode: 'debounce',
    delay: normalizedOptions.delay,
    leading: normalizedOptions.leading,
    trailing: true,
    maxWait: normalizedOptions.maxWait,
  });
}
