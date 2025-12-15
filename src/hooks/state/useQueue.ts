import { useCallback, useState } from 'react';

/**
 * Queue actions interface
 */
export type QueueActions<T> = {
  enqueue: (value: T) => void;
  dequeue: () => T | undefined;
  peek: () => T | undefined;
  clear: () => void;
  reset: () => void;
};

/**
 * Hook that implements simple queue
 *
 * @template T - Element type
 * @param initialValue - Initial queue values
 * @returns Tuple of [queue, actions]
 *
 * @example
 * ```tsx
 * const [queue, { enqueue, dequeue, peek, size }] = useQueue([1, 2, 3]);
 *
 * return (
 *   <div>
 *     <button onClick={() => enqueue(4)}>Enqueue 4</button>
 *     <button onClick={dequeue}>Dequeue</button>
 *     <p>Front: {peek()}</p>
 *     <p>Size: {size}</p>
 *     <pre>{JSON.stringify(Array.from(queue), null, 2)}</pre>
 *   </div>
 * );
 * ```
 */
export function useQueue<T>(initialValue: T[] = []): [T[], QueueActions<T> & { size: number }] {
  const [queue, setQueue] = useState<T[]>(initialValue);

  const enqueue = useCallback((value: T): void => {
    setQueue((previousQueue) => [...previousQueue, value]);
  }, []);

  const dequeue = useCallback((): T | undefined => {
    let dequeuedValue: T | undefined;
    setQueue((previousQueue) => {
      if (previousQueue.length === 0) {
        return previousQueue;
      }
      [dequeuedValue] = previousQueue;
      return previousQueue.slice(1);
    });
    return dequeuedValue;
  }, []);

  const peek = useCallback((): T | undefined => {
    return queue.length > 0 ? queue[0] : undefined;
  }, [queue]);

  const clear = useCallback((): void => {
    setQueue([]);
  }, []);

  const reset = useCallback((): void => {
    setQueue(initialValue);
  }, [initialValue]);

  const actions: QueueActions<T> & { size: number } = {
    enqueue,
    dequeue,
    peek,
    clear,
    reset,
    size: queue.length,
  };

  return [queue, actions];
}
