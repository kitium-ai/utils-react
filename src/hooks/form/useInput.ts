import { type ChangeEvent, useCallback, useState } from 'react';

/**
 * Hook for managing input state
 *
 * @param initialValue - Initial input value (default: '')
 * @returns Tuple of [value, onChange handler, { setValue, reset }]
 *
 * @example
 * ```tsx
 * const Form = () => {
 *   const [name, handleNameChange] = useInput('');
 *   return <input value={name} onChange={handleNameChange} />;
 * };
 * ```
 */
export function useInput(
  initialValue = ''
): [
  string,
  (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  { setValue: (value: string) => void; reset: () => void },
] {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(event.target.value);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return [value, onChange, { setValue, reset }];
}
