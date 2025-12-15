import { useCallback, useState } from 'react';

type UseClipboardActions = {
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
};

type UseClipboardReturn = readonly [string, UseClipboardActions];

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
export function useClipboard(initialValue = ''): UseClipboardReturn {
  const [value, setValue] = useState(initialValue);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
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
      const isSuccess = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (isSuccess) {
        setValue(text);
      }
      return isSuccess;
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  const reset = useCallback((): void => {
    setValue('');
  }, []);

  return [value, { copy, reset }] as const;
}
