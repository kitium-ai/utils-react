import { type ChangeEvent, useCallback, useState } from 'react';

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
  (event: ChangeEvent<HTMLInputElement>) => void,
  { setChecked: (nextChecked: boolean) => void; toggle: () => void },
] {
  const [isChecked, setIsChecked] = useState(initialChecked);

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  }, []);

  const toggle = useCallback(() => {
    setIsChecked((checked) => !checked);
  }, []);

  return [isChecked, onChange, { setChecked: setIsChecked, toggle }];
}
