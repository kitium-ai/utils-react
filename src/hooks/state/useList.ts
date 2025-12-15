import { useCallback, useState } from 'react';

type UseListActions<T> = {
  set: (newList: T[] | ((previous: T[]) => T[])) => void;
  push: (item: T) => void;
  removeAt: (index: number) => void;
  insertAt: (index: number, item: T) => void;
  updateAt: (index: number, item: T) => void;
  clear: () => void;
  reset: () => void;
};

type UseListReturn<T> = readonly [T[], UseListActions<T>];

/**
 * Hook for managing array state with helper methods
 *
 * @template T - The type of array elements
 * @param initialList - Initial array (default: [])
 * @returns Tuple of [list, { set, push, removeAt, insertAt, updateAt, clear, reset }]
 *
 * @example
 * ```tsx
 * const TodoList = () => {
 *   const [todos, { push, removeAt, clear }] = useList<string>([]);
 *   return (
 *     <div>
 *       {todos.map((todo, i) => (
 *         <div key={i}>
 *           {todo}
 *           <button onClick={() => removeAt(i)}>Remove</button>
 *         </div>
 *       ))}
 *       <button onClick={() => push('New Todo')}>Add</button>
 *       <button onClick={clear}>Clear All</button>
 *     </div>
 *   );
 * };
 * ```
 */
export function useList<T>(initialList: T[] = []): UseListReturn<T> {
  const [list, setList] = useState<T[]>(initialList);

  const set = useCallback((newList: T[] | ((previous: T[]) => T[])): void => {
    setList(newList);
  }, []);

  const push = useCallback((item: T): void => {
    setList((previous) => [...previous, item]);
  }, []);

  const removeAt = useCallback((index: number): void => {
    setList((previous) => previous.filter((_, index_) => index_ !== index));
  }, []);

  const insertAt = useCallback((index: number, item: T): void => {
    setList((previous) => [...previous.slice(0, index), item, ...previous.slice(index)]);
  }, []);

  const updateAt = useCallback((index: number, item: T): void => {
    setList((previous) => previous.map((element, index_) => (index_ === index ? item : element)));
  }, []);

  const clear = useCallback((): void => {
    setList([]);
  }, []);

  const reset = useCallback((): void => {
    setList(initialList);
  }, [initialList]);

  return [
    list,
    {
      set,
      push,
      removeAt,
      insertAt,
      updateAt,
      clear,
      reset,
    },
  ] as const;
}
