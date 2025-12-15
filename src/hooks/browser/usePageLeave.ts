import { useState } from 'react';

import { isBrowser } from '../../utils/ssr.js';

/**
 * Hook that triggers when mouse leaves page boundaries
 *
 * @returns Whether mouse is leaving the page
 *
 * @example
 * ```tsx
 * const isLeaving = usePageLeave();
 *
 * return (
 *   <div>
 *     {isLeaving && <div className="exit-popup">Don't leave yet!</div>}
 *   </div>
 * );
 * ```
 */
export function usePageLeave(): boolean {
  const [isLeaving, setIsLeaving] = useState<boolean>(false);

  useState(() => {
    if (!isBrowser()) {
      return;
    }

    const handleMouseLeave = (event: MouseEvent): void => {
      // Check if mouse is leaving the viewport
      if (
        event.clientY <= 0 ||
        event.clientX <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight
      ) {
        setIsLeaving(true);
      }
    };

    const handleMouseEnter = (): void => {
      setIsLeaving(false);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  });

  return isLeaving;
}
