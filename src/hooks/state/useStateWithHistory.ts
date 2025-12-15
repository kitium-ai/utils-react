import { useCallback, useState } from 'react';

/**
 * State with history actions interface
 */
export type StateWithHistoryActions<T> = {
  set: (value: T | ((previousValue: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  reset: () => void;
};

/**
 * Hook that stores previous state values and provides handles to travel through them
 *
 * @template T - State type
 * @param initialValue - Initial state value
 * @param options - History options
 * @returns Tuple of [state, actions]
 *
 * @example
 * ```tsx
 * const [value, { set, undo, redo, canUndo, canRedo }] = useStateWithHistory(0);
 *
 * return (
 *   <div>
 *     <p>Current: {value}</p>
 *     <button onClick={() => set(value + 1)}>Increment</button>
 *     <button onClick={() => set(value - 1)}>Decrement</button>
 *     <button onClick={undo} disabled={!canUndo}>Undo</button>
 *     <button onClick={redo} disabled={!canRedo}>Redo</button>
 *   </div>
 * );
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- History state management includes multiple actions and invariants.
export function useStateWithHistory<T>(
  initialValue: T,
  options: {
    capacity?: number;
    allowDuplicates?: boolean;
  } = {}
): [
  T,
  StateWithHistoryActions<T> & {
    history: T[];
    pointer: number;
    canUndo: boolean;
    canRedo: boolean;
  },
] {
  const { capacity = 10, allowDuplicates = true } = options;

  const [history, setHistory] = useState<T[]>([initialValue]);
  const [pointer, setPointer] = useState<number>(0);

  const set = useCallback(
    (value: T | ((previousValue: T) => T)): void => {
      const currentValue = history[pointer] ?? initialValue;
      const resolvedValue =
        typeof value === 'function' ? (value as (previousValue: T) => T)(currentValue) : value;

      if (!allowDuplicates && resolvedValue === currentValue) {
        return;
      }

      setHistory((previousHistory) => {
        const newHistory = previousHistory.slice(0, pointer + 1);
        newHistory.push(resolvedValue);

        // Maintain capacity
        if (newHistory.length > capacity) {
          newHistory.shift();
          setPointer(capacity - 1);
          return newHistory;
        }

        setPointer(newHistory.length - 1);
        return newHistory;
      });
    },
    [history, pointer, initialValue, capacity, allowDuplicates]
  );

  const undo = useCallback((): void => {
    if (pointer > 0) {
      setPointer((previousPointer) => previousPointer - 1);
    }
  }, [pointer]);

  const redo = useCallback((): void => {
    if (pointer < history.length - 1) {
      setPointer((previousPointer) => previousPointer + 1);
    }
  }, [pointer, history.length]);

  const clear = useCallback((): void => {
    setHistory([initialValue]);
    setPointer(0);
  }, [initialValue]);

  const reset = useCallback((): void => {
    setHistory([initialValue]);
    setPointer(0);
  }, [initialValue]);

  const actions: StateWithHistoryActions<T> & {
    history: T[];
    pointer: number;
    canUndo: boolean;
    canRedo: boolean;
  } = {
    set,
    undo,
    redo,
    clear,
    reset,
    history,
    pointer,
    canUndo: pointer > 0,
    canRedo: pointer < history.length - 1,
  };

  return [history[pointer] ?? initialValue, actions];
}
