/**
 * Factory for creating debounced and throttled callbacks
 */

import { type MutableRefObject, useCallback, useEffect, useRef } from 'react';

import type { AnyCallable, DelayedCallbackConfig, DelayedFunction } from './types.js';

type DelayedReferences<T extends AnyCallable> = {
  timeoutReference: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  maxWaitTimeoutReference: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  callbackReference: MutableRefObject<T>;
  lastCallTimeReference: MutableRefObject<number>;
  lastInvokeTimeReference: MutableRefObject<number>;
  pendingArgumentsReference: MutableRefObject<Parameters<T> | null>;
};

function useDelayedReferences<T extends AnyCallable>(function_: T): DelayedReferences<T> {
  const timeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackReference = useRef(function_);
  const lastCallTimeReference = useRef<number>(0);
  const lastInvokeTimeReference = useRef<number>(0);
  const pendingArgumentsReference = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackReference.current = function_;
  }, [function_]);

  return {
    timeoutReference,
    maxWaitTimeoutReference,
    callbackReference,
    lastCallTimeReference,
    lastInvokeTimeReference,
    pendingArgumentsReference,
  };
}

function useInvoke<T extends AnyCallable>(references: DelayedReferences<T>): () => void {
  return useCallback((): void => {
    const args = references.pendingArgumentsReference.current;
    if (!args) {
      return;
    }

    references.callbackReference.current(...args);
    references.lastInvokeTimeReference.current = Date.now();
    references.pendingArgumentsReference.current = null;
  }, [references]);
}

function useCancel<T extends AnyCallable>(references: DelayedReferences<T>): () => void {
  return useCallback((): void => {
    if (references.timeoutReference.current) {
      clearTimeout(references.timeoutReference.current);
      references.timeoutReference.current = null;
    }
    if (references.maxWaitTimeoutReference.current) {
      clearTimeout(references.maxWaitTimeoutReference.current);
      references.maxWaitTimeoutReference.current = null;
    }

    references.pendingArgumentsReference.current = null;
    references.lastCallTimeReference.current = 0;
  }, [references]);
}

function useFlush<T extends AnyCallable>(
  references: DelayedReferences<T>,
  config: DelayedCallbackConfig
): () => void {
  return useCallback((): void => {
    const args = references.pendingArgumentsReference.current;
    if (!args) {
      return;
    }

    const shouldSkipInvoke = config.mode === 'debounce' && config.leading;

    if (references.timeoutReference.current) {
      clearTimeout(references.timeoutReference.current);
      references.timeoutReference.current = null;
    }
    if (references.maxWaitTimeoutReference.current) {
      clearTimeout(references.maxWaitTimeoutReference.current);
      references.maxWaitTimeoutReference.current = null;
    }

    references.pendingArgumentsReference.current = null;
    references.lastCallTimeReference.current = 0;

    if (shouldSkipInvoke) {
      return;
    }

    references.callbackReference.current(...args);
    references.lastInvokeTimeReference.current = Date.now();
  }, [config.leading, config.mode, references]);
}

function useIsPending<T extends AnyCallable>(references: DelayedReferences<T>): () => boolean {
  return useCallback(
    (): boolean => references.pendingArgumentsReference.current !== null,
    [references]
  );
}

function useDebounceHandler<T extends AnyCallable>(
  references: DelayedReferences<T>,
  config: DelayedCallbackConfig,
  invokeFunction: () => void
): () => void {
  return useCallback((): void => {
    const isLeadingInvoke = config.leading && !references.timeoutReference.current;

    if (references.timeoutReference.current) {
      clearTimeout(references.timeoutReference.current);
    }

    if (isLeadingInvoke) {
      invokeFunction();
      references.pendingArgumentsReference.current = null;
    }

    references.timeoutReference.current = setTimeout(() => {
      references.timeoutReference.current = null;
      if (!config.leading || references.pendingArgumentsReference.current) {
        invokeFunction();
      }
    }, config.delay);

    const shouldSetMaxWait =
      config.maxWait && config.maxWait < Infinity && !references.maxWaitTimeoutReference.current;
    if (shouldSetMaxWait) {
      references.maxWaitTimeoutReference.current = setTimeout(() => {
        references.maxWaitTimeoutReference.current = null;
        invokeFunction();
      }, config.maxWait);
    }
  }, [config.delay, config.leading, config.maxWait, invokeFunction, references]);
}

function useThrottleHandler<T extends AnyCallable>(
  references: DelayedReferences<T>,
  config: DelayedCallbackConfig,
  invokeFunction: () => void
): (now: number) => void {
  return useCallback(
    (now: number): void => {
      const timeSinceLastRun = now - references.lastInvokeTimeReference.current;

      if (timeSinceLastRun >= config.delay) {
        if (config.leading) {
          invokeFunction();
        } else if (config.trailing) {
          references.timeoutReference.current = setTimeout(() => {
            if (references.pendingArgumentsReference.current) {
              invokeFunction();
            }
            references.timeoutReference.current = null;
          }, config.delay);
        }
        return;
      }

      if (config.trailing) {
        if (references.timeoutReference.current) {
          clearTimeout(references.timeoutReference.current);
        }

        const remainingDelay = config.delay - timeSinceLastRun;
        references.timeoutReference.current = setTimeout(() => {
          if (references.pendingArgumentsReference.current) {
            invokeFunction();
          }
          references.timeoutReference.current = null;
        }, remainingDelay);
      }
    },
    [config.delay, config.leading, config.trailing, invokeFunction, references]
  );
}

function useDelayedCallback<T extends AnyCallable>(
  references: DelayedReferences<T>,
  config: DelayedCallbackConfig,
  handleDebounce: () => void,
  handleThrottle: (now: number) => void
): (...args: Parameters<T>) => void {
  return useCallback(
    (...args: Parameters<T>): void => {
      const now = Date.now();
      references.pendingArgumentsReference.current = args;
      references.lastCallTimeReference.current = now;

      if (config.mode === 'debounce') {
        handleDebounce();
      } else {
        handleThrottle(now);
      }
    },
    [config.mode, handleDebounce, handleThrottle, references]
  );
}

function useCleanup(cancel: () => void): void {
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);
}

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
function useDelayedCallbackFactory<T extends AnyCallable>(
  callback: T,
  config: DelayedCallbackConfig
): DelayedFunction<T> {
  const references = useDelayedReferences(callback);

  const invokeFunction = useInvoke(references);
  const cancel = useCancel(references);
  const flush = useFlush(references, config);
  const isPending = useIsPending(references);

  const handleDebounce = useDebounceHandler(references, config, invokeFunction);
  const handleThrottle = useThrottleHandler(references, config, invokeFunction);
  const delayedCallback = useDelayedCallback(references, config, handleDebounce, handleThrottle);

  useCleanup(cancel);

  const enhancedCallback = delayedCallback as DelayedFunction<T>;
  enhancedCallback.cancel = cancel;
  enhancedCallback.flush = flush;
  enhancedCallback.isPending = isPending;

  return enhancedCallback;
}

export const createDelayedCallback = useDelayedCallbackFactory;
