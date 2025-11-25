import { useEffect, useState } from 'react';

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
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return true;
    }
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

