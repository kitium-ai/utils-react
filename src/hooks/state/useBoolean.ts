import { useCallback, useState } from 'react';

/**
 * Hook for managing boolean state with helper functions
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, { setTrue, setFalse, toggle }]
 *
 * @example
 * ```tsx
 * const Modal = () => {
 *   const [isOpen, { setTrue: open, setFalse: close, toggle }] = useBoolean();
 *   return (
 *     <>
 *       <button onClick={open}>Open</button>
 *       <button onClick={close}>Close</button>
 *       <button onClick={toggle}>Toggle</button>
 *       {isOpen && <div>Modal Content</div>}
 *     </>
 *   );
 * };
 * ```
 */
export function useBoolean(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((v) => !v), []);

  return [value, { setTrue, setFalse, toggle }] as const;
}

