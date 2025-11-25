import { useCallback, useState } from 'react';

/**
 * Hook to toggle a boolean value
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, toggle, setValue]
 *
 * @example
 * ```tsx
 * const Modal = () => {
 *   const [isOpen, toggle, setIsOpen] = useToggle();
 *   return (
 *     <>
 *       <button onClick={toggle}>Toggle Modal</button>
 *       {isOpen && <div>Modal Content</div>}
 *     </>
 *   );
 * };
 * ```
 */
export function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);

  return [value, toggle, setValue];
}
