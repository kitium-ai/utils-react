import { useCallback, useState } from 'react';

type UseBooleanActions = {
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
};

type UseBooleanReturn = readonly [boolean, UseBooleanActions];

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
export function useBoolean(initialValue = false): UseBooleanReturn {
  const [isEnabled, setIsEnabled] = useState(initialValue);

  const setTrue = useCallback((): void => setIsEnabled(true), []);
  const setFalse = useCallback((): void => setIsEnabled(false), []);
  const toggle = useCallback((): void => setIsEnabled((enabled) => !enabled), []);

  return [isEnabled, { setTrue, setFalse, toggle }] as const;
}
