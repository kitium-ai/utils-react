import { useCallback, useEffect, useRef } from 'react';

export interface DebounceOptions {
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
}

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  /**
   * The debounced function
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
export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: DebounceOptions | number = 500
): DebouncedFunction<T> {
  // Normalize options
  const opts: Required<DebounceOptions> =
    typeof options === 'number'
      ? { delay: options, leading: false, maxWait: Infinity }
      : {
          delay: options.delay ?? 500,
          leading: options.leading ?? false,
          maxWait: options.maxWait ?? Infinity,
        };

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const invokeFunction = useCallback(() => {
    const args = pendingArgsRef.current;
    if (args) {
      callbackRef.current(...args);
      lastInvokeTimeRef.current = Date.now();
      pendingArgsRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
    pendingArgsRef.current = null;
    lastCallTimeRef.current = 0;
  }, []);

  const flush = useCallback(() => {
    if (pendingArgsRef.current) {
      // Clear timers first
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
        maxWaitTimeoutRef.current = null;
      }
      // Invoke with pending args
      invokeFunction();
    }
  }, [invokeFunction]);

  const isPending = useCallback(() => {
    return pendingArgsRef.current !== null;
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const isInvoking = opts.leading && !timeoutRef.current;

      lastCallTimeRef.current = now;
      pendingArgsRef.current = args;

      // Clear existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Invoke immediately on leading edge
      if (isInvoking) {
        invokeFunction();
        pendingArgsRef.current = null;
      }

      // Set up trailing edge timeout
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (!opts.leading || pendingArgsRef.current) {
          invokeFunction();
        }
      }, opts.delay);

      // Set up max wait timeout if specified
      if (opts.maxWait < Infinity && !maxWaitTimeoutRef.current) {
        maxWaitTimeoutRef.current = setTimeout(() => {
          maxWaitTimeoutRef.current = null;
          invokeFunction();
        }, opts.maxWait);
      }
    },
    [opts.delay, opts.leading, opts.maxWait, invokeFunction]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Attach methods to the debounced function
  const enhancedCallback = debouncedCallback as DebouncedFunction<T>;
  enhancedCallback.cancel = cancel;
  enhancedCallback.flush = flush;
  enhancedCallback.isPending = isPending;

  return enhancedCallback;
}
