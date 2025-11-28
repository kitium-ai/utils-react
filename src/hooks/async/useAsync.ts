import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import type { DependencyList } from 'react';

/**
 * Async state
 */
export interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  value: T | null;
}

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
  asyncFn: () => Promise<T>,
  deps: DependencyList = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
    error: null,
    value: null,
  });

  useEffect(() => {
    let cancelled = false;

    flushSync(() => {
      setState({ loading: true, error: null, value: null });
    });

    asyncFn()
      .then((value) => {
        if (!cancelled) {
          flushSync(() => {
            setState({ loading: false, error: null, value });
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          flushSync(() => {
            setState({
              loading: false,
              error: error instanceof Error ? error : new Error(String(error)),
              value: null,
            });
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

