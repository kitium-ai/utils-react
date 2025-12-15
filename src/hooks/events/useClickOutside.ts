import { type RefObject, useEffect, useRef } from 'react';

/**
 * Hook that detects clicks outside an element
 *
 * @template T - The type of the HTML element
 * @param handler - Function to call when click is outside
 * @returns Ref object to attach to the element
 *
 * @example
 * ```tsx
 * const Dropdown = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const ref = useClickOutside(() => setIsOpen(false));
 *   return (
 *     <div ref={ref}>
 *       <button onClick={() => setIsOpen(true)}>Open</button>
 *       {isOpen && <div>Dropdown Content</div>}
 *     </div>
 *   );
 * };
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void
): RefObject<T> {
  const reference = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent): void => {
      if (reference.current && !reference.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [handler]);

  return reference;
}
