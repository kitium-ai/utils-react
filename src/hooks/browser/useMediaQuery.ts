import { useEffect, useState } from 'react';

// eslint-disable-next-line no-restricted-imports -- Internal package utility
import { isBrowser } from '../../utils/ssr.js';

/**
 * Hook that tracks a media query match
 *
 * @param query - Media query string
 * @returns True if media query matches
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 *   return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
 * };
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [isMatching, setIsMatching] = useState(() => {
    if (!isBrowser()) {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const media = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent): void => {
      setIsMatching(event.matches);
    };

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }

    // Fallback for older browsers
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [query]);

  return isMatching;
}
