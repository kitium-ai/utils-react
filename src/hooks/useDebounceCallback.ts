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
  const options_: Required<DebounceOptions> =
    typeof options === 'number'
      ? { delay: options, leading: false, maxWait: Infinity }
      : {
          delay: options.delay ?? 500,
          leading: options.leading ?? false,
          maxWait: options.maxWait ?? Infinity,
        };

  const timeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackReference = useRef(callback);
  const lastCallTimeReference = useRef<number>(0);
  const lastInvokeTimeReference = useRef<number>(0);
  const pendingArgumentsReference = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackReference.current = callback;
  }, [callback]);

  const invokeFunction = useCallback(() => {
    const args = pendingArgumentsReference.current;
    if (args) {
      callbackReference.current(...args);
      lastInvokeTimeReference.current = Date.now();
      pendingArgumentsReference.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
      timeoutReference.current = null;
    }
    if (maxWaitTimeoutReference.current) {
      clearTimeout(maxWaitTimeoutReference.current);
      maxWaitTimeoutReference.current = null;
    }
    pendingArgumentsReference.current = null;
    lastCallTimeReference.current = 0;
  }, []);

  const flush = useCallback(() => {
    if (pendingArgumentsReference.current) {
      // Clear timers first
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
        timeoutReference.current = null;
      }
      if (maxWaitTimeoutReference.current) {
        clearTimeout(maxWaitTimeoutReference.current);
        maxWaitTimeoutReference.current = null;
      }
      // Invoke with pending args
      invokeFunction();
    }
  }, [invokeFunction]);

  const isPending = useCallback(() => {
    return pendingArgumentsReference.current !== null;
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const isInvoking = options_.leading && !timeoutReference.current;

      lastCallTimeReference.current = now;
      pendingArgumentsReference.current = args;

      // Clear existing timeouts
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }

      // Invoke immediately on leading edge
      if (isInvoking) {
        invokeFunction();
        pendingArgumentsReference.current = null;
      }

      // Set up trailing edge timeout
      timeoutReference.current = setTimeout(() => {
        timeoutReference.current = null;
        if (!options_.leading || pendingArgumentsReference.current) {
          invokeFunction();
        }
      }, options_.delay);

      // Set up max wait timeout if specified
      if (options_.maxWait < Infinity && !maxWaitTimeoutReference.current) {
        maxWaitTimeoutReference.current = setTimeout(() => {
          maxWaitTimeoutReference.current = null;
          invokeFunction();
        }, options_.maxWait);
      }
    },
    [options_.delay, options_.leading, options_.maxWait, invokeFunction]
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
