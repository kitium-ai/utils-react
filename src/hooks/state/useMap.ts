import { useCallback, useState } from 'react';

/**
 * Map actions interface
 */
export type MapActions<K, V> = {
  set: (key: K, value: V) => void;
  setAll: (entries: Array<[K, V]>) => void;
  remove: (key: K) => void;
  reset: () => void;
  clear: () => void;
};

/**
 * Hook that tracks state of an object as a Map
 *
 * @template K - Key type
 * @template V - Value type
 * @param initialValue - Initial map entries
 * @returns Tuple of [map, actions]
 *
 * @example
 * ```tsx
 * const [map, { set, remove, clear }] = useMap([
 *   ['key1', 'value1'],
 *   ['key2', 'value2'],
 * ]);
 *
 * return (
 *   <div>
 *     <button onClick={() => set('key3', 'value3')}>Add item</button>
 *     <button onClick={() => remove('key1')}>Remove item</button>
 *     <button onClick={clear}>Clear all</button>
 *     <pre>{JSON.stringify(Object.fromEntries(map), null, 2)}</pre>
 *   </div>
 * );
 * ```
 */
export function useMap<K, V>(initialValue: Array<[K, V]> = []): [Map<K, V>, MapActions<K, V>] {
  const [map, setMap] = useState<Map<K, V>>(() => new Map(initialValue));

  const set = useCallback((key: K, value: V): void => {
    setMap((previousMap) => {
      const newMap = new Map(previousMap);
      newMap.set(key, value);
      return newMap;
    });
  }, []);

  const setAll = useCallback((entries: Array<[K, V]>): void => {
    setMap(() => new Map(entries));
  }, []);

  const remove = useCallback((key: K): void => {
    setMap((previousMap) => {
      const newMap = new Map(previousMap);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const reset = useCallback((): void => {
    setMap(() => new Map(initialValue));
  }, [initialValue]);

  const clear = useCallback((): void => {
    setMap(() => new Map());
  }, []);

  const actions: MapActions<K, V> = {
    set,
    setAll,
    remove,
    reset,
    clear,
  };

  return [map, actions];
}
