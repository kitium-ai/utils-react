import { useCallback, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';

/**
 * Async function state
 */
export type AsyncFunctionState<T> = {
  loading: boolean;
  error: Error | undefined;
  value: T | undefined;
};

/**
 * Hook that provides manual control over async function execution
 *
 * @template TArgs - The argument types for the async function
 * @template TResult - The return type of the async function
 * @param fn - Async function to execute
 * @returns Tuple of [state, callback]
 *
 * @example
 * ```tsx
 * const [state, fetchUser] = useAsyncFn(async (userId: string) => {
 *   const response = await fetch(`/api/users/${userId}`);
 *   return response.json();
 * });
 *
 * // Later...
 * const handleClick = () => {
 *   fetchUser('123');
 * };
 * ```
 */
export function useAsyncFunction<TArguments extends unknown[], TResult>(
  function_: (...args: TArguments) => Promise<TResult>
): [AsyncFunctionState<TResult>, (...args: TArguments) => Promise<TResult | undefined>] {
  const [state, setState] = useState<AsyncFunctionState<TResult>>({
    loading: false,
    error: undefined,
    value: undefined,
  });

  const callback = useCallback(
    async (...args: TArguments): Promise<TResult | undefined> => {
      setState((previousState) => ({ ...previousState, loading: true, error: undefined }));

      try {
        const value = await function_(...args);
        setState({ loading: false, error: undefined, value });
        return value;
      } catch (error) {
        const errorObject = error instanceof Error ? error : new Error(String(error));
        setState((previousState) => ({ ...previousState, loading: false, error: errorObject }));
        logHookError('useAsyncFunction', 'Async function failed', errorObject, { args });
        return undefined;
      }
    },
    [function_]
  );

  return [state, callback];
}
