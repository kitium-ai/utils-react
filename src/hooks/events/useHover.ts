import { type RefObject, useEffect, useRef, useState } from 'react';

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
export function useHover<T extends HTMLElement = HTMLElement>(): [RefObject<T>, boolean] {
  const [isHovered, setIsHovered] = useState(false);
  const reference = useRef<T>(null);
  const [element, setElement] = useState<T | null>(null);

  // Check ref.current on each render to detect element attachment
  if (reference.current !== element) {
    setElement(reference.current);
  }

  const handlersReference = useRef({
    handleMouseEnter: () => setIsHovered(true),
    handleMouseLeave: () => setIsHovered(false),
  });

  // Update handlers on each render to capture current setState
  handlersReference.current = {
    handleMouseEnter: () => setIsHovered(true),
    handleMouseLeave: () => setIsHovered(false),
  };

  useEffect(() => {
    if (!element) {
      return;
    }

    const { handleMouseEnter, handleMouseLeave } = handlersReference.current;

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [element]);

  return [reference, isHovered];
}
