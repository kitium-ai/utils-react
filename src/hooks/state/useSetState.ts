import { useCallback, useState } from 'react';

/**
 * Hook for managing object state with partial updates
 *
 * @template T - The type of the state object
 * @param initialState - Initial state object or function that returns state
 * @returns Tuple of [state, setState] where setState accepts partial updates
 *
 * @example
 * ```tsx
 * const UserForm = () => {
 *   const [user, setUser] = useSetState({ name: '', email: '' });
 *   return (
 *     <div>
 *       <input
 *         value={user.name}
 *         onChange={(e) => setUser({ name: e.target.value })}
 *       />
 *       <input
 *         value={user.email}
 *         onChange={(e) => setUser({ email: e.target.value })}
 *       />
 *     </div>
 *   );
 * };
 * ```
 */
export function useSetState<T extends Record<string, unknown>>(
  initialState: T | (() => T)
): [T, (updates: Partial<T> | ((state: T) => Partial<T>)) => void] {
  const [state, setState] = useState(initialState);

  const setMergeState = useCallback(
    (updates: Partial<T> | ((state: T) => Partial<T>)) => {
      setState((prev) => ({
        ...prev,
        ...(typeof updates === 'function' ? updates(prev) : updates),
      }));
    },
    []
  );

  return [state, setMergeState];
}

