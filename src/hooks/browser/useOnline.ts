import { useEffect, useState } from 'react';

// eslint-disable-next-line no-restricted-imports -- Internal package utility
import { isBrowser } from '../../utils/ssr.js';

/**
 * Hook that tracks online/offline status
 *
 * @returns True if online, false if offline
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const isOnline = useOnline();
 *   return <div>{isOnline ? 'Online' : 'Offline'}</div>;
 * };
 * ```
 */
export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    if (!isBrowser() || typeof navigator === 'undefined') {
      return true;
    }
    return navigator.onLine;
  });

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
