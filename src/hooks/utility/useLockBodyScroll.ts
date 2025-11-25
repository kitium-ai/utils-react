import { useEffect } from 'react';

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
 */
export function useLockBodyScroll(lock = true): void {
  useEffect(() => {
    if (!lock) {
      return;
    }

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}

