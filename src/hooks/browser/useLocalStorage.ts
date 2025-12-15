/**
 * Hook that syncs state with localStorage
 */

import { createStorageHook } from './storage/createStorageHook.js';
import type { StorageHookResult } from './storage/types.js';

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
 * Automatically syncs across tabs/windows via storage events.
 */
export function useLocalStorage<T>(key: string, initialValue: T): StorageHookResult<T> {
  return createStorageHook<T>({ type: 'localStorage', key }, initialValue);
}
