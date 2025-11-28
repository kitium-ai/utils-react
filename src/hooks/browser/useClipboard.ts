import { useCallback, useState } from 'react';

/**
 * Hook for clipboard operations
 *
 * @param initialValue - Initial clipboard value
 * @returns Tuple of [value, { copy, reset }]
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [, { copy }] = useClipboard();
 *   return <button onClick={() => copy('Hello')}>Copy</button>;
 * };
 * ```
 */
export function useClipboard(initialValue = '') {
  const [value, setValue] = useState(initialValue);

  const copy = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setValue(text);
        return true;
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (success) {
        setValue(text);
      }
      return success;
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setValue('');
  }, []);

  return [value, { copy, reset }] as const;
}
