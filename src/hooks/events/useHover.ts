import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Hook that tracks hover state
 *
 * @template T - The type of the HTML element
 * @returns Tuple of [ref, isHovered]
 *
 * @example
 * ```tsx
 * const Button = () => {
 *   const [ref, isHovered] = useHover<HTMLButtonElement>();
 *   return (
 *     <button ref={ref} style={{ opacity: isHovered ? 0.8 : 1 }}>
 *       Hover me
 *     </button>
 *   );
 * };
 * ```
 */
export function useHover<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  boolean
] {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
}

