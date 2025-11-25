import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

/**
 * Hook that syncs state with sessionStorage
 *
 * @template T - The type of the stored value
 * @param key - sessionStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [storedValue, setValue]
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [theme, setTheme] = useSessionStorage('theme', 'light');
 *   return <div>Theme: {theme}</div>;
 * };
 * ```
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue && e.storageArea === sessionStorage) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(
            `Error parsing storage event for key "${key}":`,
            error
          );
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

