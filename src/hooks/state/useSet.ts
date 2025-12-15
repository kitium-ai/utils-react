import { useCallback, useState } from 'react';

/**
 * Set actions interface
 */
export type SetActions<T> = {
  add: (value: T) => void;
  remove: (value: T) => void;
  toggle: (value: T) => void;
  reset: () => void;
  clear: () => void;
  has: (value: T) => boolean;
};

/**
 * Hook that tracks state of a Set
 *
 * @template T - Element type
 * @param initialValue - Initial set values
 * @returns Tuple of [set, actions]
 *
 * @example
 * ```tsx
 * const [set, { add, remove, toggle, has }] = useSet([1, 2, 3]);
 *
 * return (
 *   <div>
 *     <button onClick={() => add(4)}>Add 4</button>
 *     <button onClick={() => remove(2)}>Remove 2</button>
 *     <button onClick={() => toggle(5)}>Toggle 5</button>
 *     <p>Has 3: {String(has(3))}</p>
 *     <pre>{JSON.stringify(Array.from(set), null, 2)}</pre>
 *   </div>
 * );
 * ```
 */
export function useSet<T>(initialValue: T[] = []): [Set<T>, SetActions<T>] {
  const [set, setSet] = useState<Set<T>>(() => new Set(initialValue));

  const add = useCallback((value: T): void => {
    setSet((previousSet) => {
      const newSet = new Set(previousSet);
      newSet.add(value);
      return newSet;
    });
  }, []);

  const remove = useCallback((value: T): void => {
    setSet((previousSet) => {
      const newSet = new Set(previousSet);
      newSet.delete(value);
      return newSet;
    });
  }, []);

  const toggle = useCallback((value: T): void => {
    setSet((previousSet) => {
      const newSet = new Set(previousSet);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  }, []);

  const reset = useCallback((): void => {
    setSet(() => new Set(initialValue));
  }, [initialValue]);

  const clear = useCallback((): void => {
    setSet(() => new Set());
  }, []);

  const has = useCallback(
    (value: T): boolean => {
      return set.has(value);
    },
    [set]
  );

  const actions: SetActions<T> = {
    add,
    remove,
    toggle,
    reset,
    clear,
    has,
  };

  return [set, actions];
}
