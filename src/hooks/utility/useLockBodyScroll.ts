import { useEffect } from 'react';

import { isBrowser, isDOMAvailable } from '../../utils/ssr';

/**
 * Hook that locks body scroll
 *
 * @param lock - Whether to lock scroll (default: true)
 *
 * @example
 * ```tsx
 * const Modal = ({ isOpen }: { isOpen: boolean }) => {
 *   useLockBodyScroll(isOpen);
 *   return isOpen ? <div>Modal Content</div> : null;
 * };
 * ```
 *
 * @remarks
 * SSR-safe: This hook checks for browser and DOM availability before attempting
 * to manipulate the document body. In server-side rendering environments, the hook
 * will safely return without errors.
 */
export function useLockBodyScroll(lock = true): void {
  useEffect(() => {
    if (!lock || !isBrowser() || !isDOMAvailable()) {
      return;
    }

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}
