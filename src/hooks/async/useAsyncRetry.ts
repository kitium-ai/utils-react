import { useCallback, useRef, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';

/**
 * Async retry state
 */
export type AsyncRetryState<T> = {
  loading: boolean;
  error: Error | undefined;
  value: T | undefined;
  retryCount: number;
};

/**
 * Hook that provides async function execution with retry capability
 *
 * @template TArgs - The argument types for the async function
 * @template TResult - The return type of the async function
 * @param fn - Async function to execute
 * @param options - Retry options
 * @returns Tuple of [state, callback, retry]
 *
 * @example
 * ```tsx
 * const [state, fetchUser, retry] = useAsyncRetry(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error('Failed to fetch');
 *     return response.json();
 *   },
 *   { retries: 3, retryDelay: attempt => attempt * 1000 }
 * );
 *
 * // Later...
 * const handleClick = () => {
 *   fetchUser('123');
 * };
 *
 * // Or retry the last call
 * const handleRetry = () => {
 *   retry();
 * };
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- Retry logic requires branching and timing.
export function useAsyncRetry<TArguments extends unknown[], TResult>(
  function_: (...args: TArguments) => Promise<TResult>,
  options: {
    retries?: number;
    retryDelay?: number | ((attempt: number) => number);
  } = {}
): [
  AsyncRetryState<TResult>,
  (...args: TArguments) => Promise<TResult | undefined>,
  () => Promise<TResult | undefined>,
] {
  const { retries = 3, retryDelay = 1000 } = options;

  const [state, setState] = useState<AsyncRetryState<TResult>>({
    loading: false,
    error: undefined,
    value: undefined,
    retryCount: 0,
  });

  const lastArgumentsReference = useRef<TArguments | undefined>();

  const executeWithRetry = useCallback(
    async (args: TArguments, currentRetryCount = 0): Promise<TResult | undefined> => {
      try {
        const value = await function_(...args);
        setState({
          loading: false,
          error: undefined,
          value,
          retryCount: currentRetryCount,
        });
        return value;
      } catch (error) {
        const errorObject = error instanceof Error ? error : new Error(String(error));

        if (currentRetryCount < retries) {
          const delay =
            typeof retryDelay === 'function' ? retryDelay(currentRetryCount + 1) : retryDelay;

          setState((previousState) => ({
            ...previousState,
            retryCount: currentRetryCount + 1,
          }));

          await new Promise<void>((resolve) => {
            setTimeout(resolve, delay);
          });
          return executeWithRetry(args, currentRetryCount + 1);
        }

        setState({
          loading: false,
          error: errorObject,
          value: undefined,
          retryCount: currentRetryCount,
        });
        logHookError('useAsyncRetry', 'Async function failed after retries', errorObject, {
          args,
          retryCount: currentRetryCount,
        });
        return undefined;
      }
    },
    [function_, retries, retryDelay]
  );

  const callback = useCallback(
    async (...args: TArguments): Promise<TResult | undefined> => {
      lastArgumentsReference.current = args;
      setState((previousState) => ({
        ...previousState,
        loading: true,
        error: undefined,
        retryCount: 0,
      }));

      return executeWithRetry(args);
    },
    [executeWithRetry]
  );

  const retry = useCallback(async (): Promise<TResult | undefined> => {
    if (!lastArgumentsReference.current) {
      throw new Error('No previous arguments to retry with');
    }
    setState((previousState) => ({
      ...previousState,
      loading: true,
      error: undefined,
      retryCount: 0,
    }));

    return executeWithRetry(lastArgumentsReference.current);
  }, [executeWithRetry]);

  return [state, callback, retry];
}
