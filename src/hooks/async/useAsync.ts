import { type DependencyList, useEffect, useState } from 'react';

/**
 * Async state
 */
export type AsyncState<T> = {
  loading: boolean;
  error: Error | null;
  value: T | null;
};

/**
 * Hook that executes an async function and tracks its state
 *
 * @template T - The return type of the async function
 * @param asyncFn - Async function to execute
 * @param deps - Dependency array (default: [])
 * @returns Async state object
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const { loading, error, value } = useAsync(async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   });
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   return <div>{JSON.stringify(value)}</div>;
 * };
 * ```
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: DependencyList = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
    error: null,
    value: null,
  });

  useEffect(() => {
    let isCancelled = false;

    setState({ loading: true, error: null, value: null });

    const run = async (): Promise<void> => {
      try {
        const value = await asyncFunction();
        if (isCancelled) {
          return;
        }

        setState({ loading: false, error: null, value });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
          value: null,
        });
      }
    };

    void run();

    return () => {
      isCancelled = true;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps -- `deps` is caller-controlled for this hook.

  return state;
}
