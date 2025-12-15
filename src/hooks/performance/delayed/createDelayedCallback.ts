/**
 * Factory for creating debounced and throttled callbacks
 */

import { useCallback, useEffect, useRef } from 'react';

import type { AnyCallable, DelayedCallbackConfig, DelayedFunction } from './types.js';

/**
 * Create a delayed callback (debounced or throttled)
 *
 * @internal This is an internal factory function. Use useDebounceCallback or useThrottleCallback instead.
 *
 * @template T - The type of the callback function
 * @param callback - The callback to delay
 * @param config - Delay configuration (mode, delay, leading, trailing, maxWait)
 * @returns Enhanced callback with cancel, flush, and isPending methods
 */
export function createDelayedCallback<T extends AnyCallable>(
  callback: T,
  config: DelayedCallbackConfig
): DelayedFunction<T> {
  const timeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackReference = useRef(callback);
  const lastCallTimeReference = useRef<number>(0);
  const lastInvokeTimeReference = useRef<number>(0);
  const pendingArgumentsReference = useRef<unknown[] | null>(null);

  // Update callback reference whenever it changes
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
    const args = pendingArgumentsReference.current;
    if (!args) {
      return;
    }

    const shouldSkipInvoke = config.mode === 'debounce' && config.leading;

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

    if (shouldSkipInvoke) {
      return;
    }

    callbackReference.current(...args);
    lastInvokeTimeReference.current = Date.now();
  }, [config.mode, config.leading]);

  const isPending = useCallback(() => {
    return pendingArgumentsReference.current !== null;
  }, []);

  const handleDebounce = useCallback(() => {
    const isLeadingInvoke = config.leading && !timeoutReference.current;

    // Clear existing timeout to reset the delay
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
    }

    // Invoke immediately if leading edge is enabled and no timeout exists
    if (isLeadingInvoke) {
      invokeFunction();
      pendingArgumentsReference.current = null;
    }

    // Set timeout for trailing edge invocation
    timeoutReference.current = setTimeout(() => {
      timeoutReference.current = null;
      // Only invoke on trailing if not already invoked on leading
      if (!config.leading || pendingArgumentsReference.current) {
        invokeFunction();
      }
    }, config.delay);

    // Set maxWait timeout if specified
    const shouldSetMaxWait =
      config.maxWait && config.maxWait < Infinity && !maxWaitTimeoutReference.current;
    if (shouldSetMaxWait) {
      maxWaitTimeoutReference.current = setTimeout(() => {
        maxWaitTimeoutReference.current = null;
        invokeFunction();
      }, config.maxWait);
    }
  }, [config.leading, config.delay, config.maxWait, invokeFunction]);

  const handleThrottle = useCallback(
    (now: number) => {
      const timeSinceLastRun = now - lastInvokeTimeReference.current;

      // If enough time has passed, invoke immediately
      if (timeSinceLastRun >= config.delay) {
        if (config.leading) {
          invokeFunction();
        } else if (config.trailing) {
          // Schedule for later
          timeoutReference.current = setTimeout(() => {
            if (pendingArgumentsReference.current) {
              invokeFunction();
            }
            timeoutReference.current = null;
          }, config.delay);
        }
        return;
      }

      // Schedule for trailing edge
      if (config.trailing) {
        if (timeoutReference.current) {
          clearTimeout(timeoutReference.current);
        }

        const remainingDelay = config.delay - timeSinceLastRun;
        timeoutReference.current = setTimeout(() => {
          if (pendingArgumentsReference.current) {
            invokeFunction();
          }
          timeoutReference.current = null;
        }, remainingDelay);
      }
    },
    [config.delay, config.leading, config.trailing, invokeFunction]
  );

  const delayedCallback = useCallback(
    (...args: unknown[]) => {
      const now = Date.now();
      pendingArgumentsReference.current = args;
      lastCallTimeReference.current = now;

      if (config.mode === 'debounce') {
        handleDebounce();
      } else {
        handleThrottle(now);
      }
    },
    [config.mode, handleDebounce, handleThrottle]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Cast the callback as a DelayedFunction with the additional methods
  const enhancedCallback = delayedCallback as DelayedFunction<T>;
  enhancedCallback.cancel = cancel;
  enhancedCallback.flush = flush;
  enhancedCallback.isPending = isPending;

  return enhancedCallback;
}
