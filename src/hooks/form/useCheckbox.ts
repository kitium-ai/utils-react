import { useCallback, useState, ChangeEvent } from 'react';

/**
 * Hook for managing checkbox state
 *
 * @param initialChecked - Initial checked state (default: false)
 * @returns Tuple of [checked, onChange handler, { setChecked, toggle }]
 *
 * @example
 * ```tsx
 * const Form = () => {
 *   const [agreed, handleAgreedChange] = useCheckbox(false);
 *   return <input type="checkbox" checked={agreed} onChange={handleAgreedChange} />;
 * };
 * ```
 */
export function useCheckbox(
  initialChecked = false
): [
  boolean,
  (e: ChangeEvent<HTMLInputElement>) => void,
  { setChecked: (checked: boolean) => void; toggle: () => void }
] {
  const [checked, setChecked] = useState(initialChecked);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  }, []);

  const toggle = useCallback(() => {
    setChecked((c) => !c);
  }, []);

  return [checked, onChange, { setChecked, toggle }];
}

