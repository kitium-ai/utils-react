/**
 * SSR-safe environment detection utilities
 *
 * These utilities help ensure hooks work correctly in both browser and server environments,
 * providing graceful fallbacks for SSR scenarios.
 */

/**
 * Checks if code is running in a browser environment
 * @returns True if window is defined (browser), false otherwise (SSR)
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Checks if code is running in a server environment
 * @returns True if window is undefined (SSR), false otherwise (browser)
 */
export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

/**
 * Checks if DOM APIs are available
 * @returns True if document is defined and accessible
 */
export const isDOMAvailable = (): boolean => {
  return typeof document !== 'undefined';
};

/**
 * Checks if Performance API is available
 * @returns True if performance is defined and accessible
 */
export const isPerformanceAvailable = (): boolean => {
  return typeof performance !== 'undefined' && typeof performance.now === 'function';
};

/**
 * Checks if localStorage is available and accessible
 * @returns True if localStorage is available and can be used
 */
export const isLocalStorageAvailable = (): boolean => {
  if (!isBrowser()) {
    return false;
  }

  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if sessionStorage is available and accessible
 * @returns True if sessionStorage is available and can be used
 */
export const isSessionStorageAvailable = (): boolean => {
  if (!isBrowser()) {
    return false;
  }

  try {
    const testKey = '__sessionStorage_test__';
    window.sessionStorage.setItem(testKey, 'test');
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely gets window object
 * @returns Window object if available, undefined otherwise
 */
export const getWindow = (): Window | undefined => {
  return isBrowser() ? window : undefined;
};

/**
 * Safely gets document object
 * @returns Document object if available, undefined otherwise
 */
export const getDocument = (): Document | undefined => {
  return isDOMAvailable() ? document : undefined;
};

/**
 * No-op function for SSR fallbacks
 */
export const noop = (): void => {
  // Intentionally empty
};
