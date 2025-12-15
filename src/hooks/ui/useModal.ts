import { useCallback, useState } from 'react';

type UseModalActions = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

type UseModalReturn = readonly [boolean, UseModalActions];

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
export function useModal(initialOpen = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback((): void => setIsOpen(true), []);
  const close = useCallback((): void => setIsOpen(false), []);
  const toggle = useCallback((): void => setIsOpen((open_) => !open_), []);

  return [isOpen, { open, close, toggle }] as const;
}
