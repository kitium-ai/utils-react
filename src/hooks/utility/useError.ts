import { useCallback, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';

/**
 * Hook for managing error state and dispatching errors
 *
 * @returns Tuple of [error, dispatchError, clearError]
 *
 * @example
 * ```tsx
 * const [error, dispatchError, clearError] = useError();
 *
 * const handleApiCall = async () => {
 *   try {
 *     await riskyApiCall();
 *   } catch (err) {
 *     dispatchError(err);
 *   }
 * };
 *
 * return (
 *   <div>
 *     {error && <div className="error">{error.message}</div>}
 *     <button onClick={clearError}>Clear Error</button>
 *   </div>
 * );
 * ```
 */
export function useError(): [Error | undefined, (error: unknown) => void, () => void] {
  const [error, setError] = useState<Error | undefined>();

  const dispatchError = useCallback((error_: unknown): void => {
    const errorObject = error_ instanceof Error ? error_ : new Error(String(error_));
    setError(errorObject);
    logHookError('useError', 'Error dispatched', errorObject);
  }, []);

  const clearError = useCallback((): void => {
    setError(undefined);
  }, []);

  return [error, dispatchError, clearError];
}
