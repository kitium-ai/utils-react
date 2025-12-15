import { useCallback, useState } from 'react';

/**
 * Stack actions interface
 */
export type StackActions<T> = {
  push: (value: T) => void;
  pop: () => T | undefined;
  peek: () => T | undefined;
  clear: () => void;
  reset: () => void;
};

/**
 * Hook that implements LIFO stack
 *
 * @template T - Element type
 * @param initialValue - Initial stack values
 * @returns Tuple of [stack, actions]
 *
 * @example
 * ```tsx
 * const [stack, { push, pop, peek, size }] = useStack([1, 2, 3]);
 *
 * return (
 *   <div>
 *     <button onClick={() => push(4)}>Push 4</button>
 *     <button onClick={pop}>Pop</button>
 *     <p>Top: {peek()}</p>
 *     <p>Size: {size}</p>
 *     <pre>{JSON.stringify(stack, null, 2)}</pre>
 *   </div>
 * );
 * ```
 */
export function useStack<T>(initialValue: T[] = []): [T[], StackActions<T> & { size: number }] {
  const [stack, setStack] = useState<T[]>(initialValue);

  const push = useCallback((value: T): void => {
    setStack((previousStack) => [...previousStack, value]);
  }, []);

  const pop = useCallback((): T | undefined => {
    let poppedValue: T | undefined;
    setStack((previousStack) => {
      if (previousStack.length === 0) {
        return previousStack;
      }
      poppedValue = previousStack[previousStack.length - 1];
      return previousStack.slice(0, -1);
    });
    return poppedValue;
  }, []);

  const peek = useCallback((): T | undefined => {
    return stack.length > 0 ? stack[stack.length - 1] : undefined;
  }, [stack]);

  const clear = useCallback((): void => {
    setStack([]);
  }, []);

  const reset = useCallback((): void => {
    setStack(initialValue);
  }, [initialValue]);

  const actions: StackActions<T> & { size: number } = {
    push,
    pop,
    peek,
    clear,
    reset,
    size: stack.length,
  };

  return [stack, actions];
}
