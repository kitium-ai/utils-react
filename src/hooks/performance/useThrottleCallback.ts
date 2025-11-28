import { useCallback, useEffect, useRef } from 'react';

export interface ThrottleOptions {
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
}

export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  /**
   * The throttled function
   */
  (...args: Parameters<T>): void;
  /**
   * Cancel any pending invocations
   */
  cancel: () => void;
  /**
   * Immediately invoke any pending invocations
   */
  flush: () => void;
  /**
   * Check if there is a pending invocation
   */
  isPending: () => boolean;
}

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
export function useThrottleCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: ThrottleOptions | number = 500
): ThrottledFunction<T> {
  // Normalize options
  const options_: Required<ThrottleOptions> =
    typeof options === 'number'
      ? { delay: options, leading: true, trailing: true }
      : {
          delay: options.delay ?? 500,
          leading: options.leading ?? true,
          trailing: options.trailing ?? true,
        };

  const timeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRunReference = useRef<number>(0);
  const callbackReference = useRef(callback);
  const pendingArgumentsReference = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackReference.current = callback;
  }, [callback]);

  const invokeFunction = useCallback((args: Parameters<T>) => {
    callbackReference.current(...args);
    lastRunReference.current = Date.now();
    pendingArgumentsReference.current = null;
  }, []);

  const cancel = useCallback(() => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
      timeoutReference.current = null;
    }
    pendingArgumentsReference.current = null;
  }, []);

  const flush = useCallback(() => {
    const args = pendingArgumentsReference.current;
    if (args) {
      cancel();
      invokeFunction(args);
    }
  }, [cancel, invokeFunction]);

  const isPending = useCallback(() => {
    return pendingArgumentsReference.current !== null;
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunReference.current;

      pendingArgumentsReference.current = args;

      // Leading edge invocation
      if (timeSinceLastRun >= options_.delay) {
        if (options_.leading) {
          invokeFunction(args);
        } else if (options_.trailing) {
          // If leading is disabled but trailing is enabled, schedule for later
          timeoutReference.current = setTimeout(() => {
            if (pendingArgumentsReference.current) {
              invokeFunction(pendingArgumentsReference.current);
            }
            timeoutReference.current = null;
          }, options_.delay);
        }
        return;
      }

      // Trailing edge invocation
      if (options_.trailing) {
        if (timeoutReference.current) {
          clearTimeout(timeoutReference.current);
        }

        timeoutReference.current = setTimeout(() => {
          if (pendingArgumentsReference.current) {
            invokeFunction(pendingArgumentsReference.current);
          }
          timeoutReference.current = null;
        }, options_.delay - timeSinceLastRun);
      }
    },
    [options_.delay, options_.leading, options_.trailing, invokeFunction]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Attach methods to the throttled function
  const enhancedCallback = throttledCallback as ThrottledFunction<T>;
  enhancedCallback.cancel = cancel;
  enhancedCallback.flush = flush;
  enhancedCallback.isPending = isPending;

  return enhancedCallback;
}
