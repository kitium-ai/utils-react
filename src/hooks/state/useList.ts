import { useCallback, useState } from 'react';

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
export function useList<T>(initialList: T[] = []) {
  const [list, setList] = useState<T[]>(initialList);

  const set = useCallback((newList: T[] | ((previous: T[]) => T[])) => {
    setList(newList);
  }, []);

  const push = useCallback((item: T) => {
    setList((previous) => [...previous, item]);
  }, []);

  const removeAt = useCallback((index: number) => {
    setList((previous) => previous.filter((_, index_) => index_ !== index));
  }, []);

  const insertAt = useCallback((index: number, item: T) => {
    setList((previous) => [...previous.slice(0, index), item, ...previous.slice(index)]);
  }, []);

  const updateAt = useCallback((index: number, item: T) => {
    setList((previous) => previous.map((element, index_) => (index_ === index ? item : element)));
  }, []);

  const clear = useCallback(() => {
    setList([]);
  }, []);

  const reset = useCallback(() => {
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
