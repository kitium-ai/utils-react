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
  const opts: Required<ThrottleOptions> =
    typeof options === 'number'
      ? { delay: options, leading: true, trailing: true }
      : {
          delay: options.delay ?? 500,
          leading: options.leading ?? true,
          trailing: options.trailing ?? true,
        };

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRunRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const invokeFunction = useCallback((args: Parameters<T>) => {
    callbackRef.current(...args);
    lastRunRef.current = Date.now();
    pendingArgsRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    const args = pendingArgsRef.current;
    if (args) {
      cancel();
      invokeFunction(args);
    }
  }, [cancel, invokeFunction]);

  const isPending = useCallback(() => {
    return pendingArgsRef.current !== null;
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      pendingArgsRef.current = args;

      // Leading edge invocation
      if (timeSinceLastRun >= opts.delay) {
        if (opts.leading) {
          invokeFunction(args);
        } else if (opts.trailing) {
          // If leading is disabled but trailing is enabled, schedule for later
          timeoutRef.current = setTimeout(() => {
            if (pendingArgsRef.current) {
              invokeFunction(pendingArgsRef.current);
            }
            timeoutRef.current = null;
          }, opts.delay);
        }
        return;
      }

      // Trailing edge invocation
      if (opts.trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (pendingArgsRef.current) {
            invokeFunction(pendingArgsRef.current);
          }
          timeoutRef.current = null;
        }, opts.delay - timeSinceLastRun);
      }
    },
    [opts.delay, opts.leading, opts.trailing, invokeFunction]
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

