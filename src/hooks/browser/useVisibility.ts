import { useEffect, useState } from 'react';

/**
 * Hook that tracks page visibility
 *
 * @returns True if page is visible, false if hidden
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const isVisible = useVisibility();
 *   return <div>{isVisible ? 'Visible' : 'Hidden'}</div>;
 * };
 * ```
 */
export function useVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof document === 'undefined') {
      return true;
    }
    return !document.hidden;
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = (): void => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
