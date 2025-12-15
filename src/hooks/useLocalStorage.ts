import { useCallback, useEffect, useState } from 'react';

import { logHookWarning } from '../utils/errorLogging.js';
import { isBrowser } from '../utils/ssr.js';

type SetValue<T> = (value: T | ((value_: T) => T)) => void;

/**
 * Hook that syncs state with localStorage
 *
 * @template T - The type of the stored value
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [storedValue, setValue]
 *
 * @example
 * ```tsx
 * const Settings = () => {
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 *   return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *     Current: {theme}
 *   </button>;
 * };
 * ```
 *
 * @remarks
 * SSR-safe: This hook safely handles server-side rendering by checking for window availability.
 * In SSR environments, it returns the initialValue and skips localStorage operations.
 * Storage events are also safely handled with proper environment checks.
 */
// eslint-disable-next-line max-lines-per-function -- Storage hook requires event listeners and error handling
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser()) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      logHookWarning('useLocalStorage', `Error reading localStorage key "${key}"`, { error, key });
      return initialValue;
    }
  });

  // Wrapped setValue function that also updates localStorage
  const setValue: SetValue<T> = useCallback(
    (value): void => {
      try {
        // Allow value to be a function (like useState)
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (isBrowser()) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        logHookWarning('useLocalStorage', `Error setting localStorage key "${key}"`, {
          error,
          key,
        });
      }
    },
    [key, storedValue]
  );

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          logHookWarning('useLocalStorage', `Error parsing storage event for key "${key}"`, {
            error,
            key,
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
