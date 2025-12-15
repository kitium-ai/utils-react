/**
 * Factory function for creating storage hooks
 * Supports both localStorage and sessionStorage with SSR safety
 */

import { useCallback, useEffect, useState } from 'react';

import { logHookWarning } from '../../../utils/errorLogging.js';
import { isBrowser } from '../../../utils/ssr.js';
import type { SetStorageValue, StorageConfig, StorageHookResult } from './types.js';

/**
 * Create a storage hook for either localStorage or sessionStorage
 *
 * @template T - The type of the stored value
 * @param config - Storage configuration (type and key)
 * @param initialValue - Initial value if key doesn't exist in storage
 * @returns Tuple of [storedValue, setValue]
 *
 * @internal This is an internal factory function. Use useLocalStorage or useSessionStorage instead.
 *
 * @example
 * ```tsx
 * // This is for internal use. Use useLocalStorage instead:
 * const [value, setValue] = useLocalStorage('key', 'default');
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- Storage hook includes parsing, persistence, and cross-tab sync.
function useStorageHook<T>(config: StorageConfig, initialValue: T): StorageHookResult<T> {
  const { type, key } = config;

  // Get initial value from storage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR safety: window is not available on the server
    if (!isBrowser()) {
      return initialValue;
    }

    try {
      const storage = type === 'localStorage' ? window.localStorage : window.sessionStorage;
      const item = storage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      logHookWarning('useStorage', `Error reading ${type} key "${key}"`, { error, key, type });
      return initialValue;
    }
  });

  // Wrapped setValue function that also updates storage
  const setValue: SetStorageValue<T> = useCallback(
    (value): void => {
      try {
        // Allow value to be a function (like useState)
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to storage
        if (isBrowser()) {
          const storage = type === 'localStorage' ? window.localStorage : window.sessionStorage;
          storage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        logHookWarning('useStorage', `Error setting ${type} key "${key}"`, { error, key, type });
      }
    },
    [key, storedValue, type]
  );

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    // SSR safety
    if (!isBrowser()) {
      return;
    }

    const handleStorageChange = (event: StorageEvent): void => {
      const storage = type === 'localStorage' ? window.localStorage : window.sessionStorage;

      // Check if this event is for our key and storage type
      if (event.key === key && event.newValue && event.storageArea === storage) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          logHookWarning('useStorage', `Error parsing ${type} event for key "${key}"`, {
            error,
            key,
            type,
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, type]);

  return [storedValue, setValue];
}

export const createStorageHook = useStorageHook;
