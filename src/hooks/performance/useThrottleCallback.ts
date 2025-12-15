/**
 * Hook that throttles a callback function
 */

import { createDelayedCallback } from './delayed/createDelayedCallback.js';
import type { AnyCallable, DelayedFunction } from './delayed/types.js';

export type ThrottleOptions = {
  /**
   * Delay in milliseconds (default: 500)
   */
  delay?: number;
  /**
   * Invoke the callback on the leading edge (default: true)
   */
  leading?: boolean;
  /**
   * Invoke the callback on the trailing edge (default: true)
   */
  trailing?: boolean;
};

/**
 * Throttled function type with cancel, flush, and isPending methods
 */
export type ThrottledFunction<T extends AnyCallable> = DelayedFunction<T>;

/**
 * Hook that throttles a callback function with advanced options
 *
 * @template T - The callback function type
 * @param callback - The callback function to throttle
 * @param options - Throttle configuration options or delay in milliseconds (for backwards compatibility)
 * @returns The throttled callback function with cancel, flush, and isPending methods
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const handleScroll = useThrottleCallback(() => {
 *     console.log('Scrolled');
 *   }, { delay: 100, leading: true, trailing: true });
 *
 *   return (
 *     <div onScroll={handleScroll}>
 *       Content
 *       <button onClick={handleScroll.cancel}>Cancel</button>
 *       <button onClick={handleScroll.flush}>Execute Now</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @remarks
 * This hook provides a configurable throttle implementation with:
 * - Leading and trailing edge invocation control
 * - Cancel and flush methods for manual control
 * - Backwards compatible with simple delay parameter
 */
export function useThrottleCallback<T extends AnyCallable>(
  callback: T,
  options: ThrottleOptions | number = 500
): ThrottledFunction<T> {
  // Normalize options
  const normalizedOptions =
    typeof options === 'number'
      ? { delay: options, leading: true, trailing: true }
      : {
          delay: options.delay ?? 500,
          leading: options.leading ?? true,
          trailing: options.trailing ?? true,
        };

  return createDelayedCallback(callback, {
    mode: 'throttle',
    delay: normalizedOptions.delay,
    leading: normalizedOptions.leading,
    trailing: normalizedOptions.trailing,
  });
}
