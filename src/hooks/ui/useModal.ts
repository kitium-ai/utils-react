import { useCallback, useState } from 'react';

/**
 * Hook for managing modal state
 *
 * @param initialOpen - Initial open state (default: false)
 * @returns Tuple of [isOpen, { open, close, toggle }]
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [isOpen, { open, close, toggle }] = useModal();
 *   return (
 *     <>
 *       <button onClick={open}>Open Modal</button>
 *       {isOpen && (
 *         <div>
 *           <button onClick={close}>Close</button>
 *           Modal Content
 *         </div>
 *       )}
 *     </>
 *   );
 * };
 * ```
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return [isOpen, { open, close, toggle }] as const;
}

