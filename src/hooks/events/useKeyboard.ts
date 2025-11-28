import { useEffect } from 'react';

/**
 * Options for useKeyboard hook
 */
export interface UseKeyboardOptions {
  target?: 'window' | 'document' | HTMLElement;
  event?: 'keydown' | 'keyup' | 'keypress';
}

/**
 * Hook that handles keyboard events
 *
 * @param handler - Function to call on keyboard event
 * @param options - Options for keyboard handling
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   useKeyboard((event) => {
 *     if (event.key === 'Escape') {
 *       console.log('Escape pressed');
 *     }
 *   });
 *   return <div>Press Escape</div>;
 * };
 * ```
 */
export function useKeyboard(
  handler: (event: KeyboardEvent) => void,
  options: UseKeyboardOptions = {}
): void {
  const { target = 'window', event: eventType = 'keydown' } = options;

  useEffect(() => {
    const targetElement = target === 'window' ? window : target === 'document' ? document : target;

    const handleKeyboard = (e: Event) => {
      handler(e as KeyboardEvent);
    };

    targetElement.addEventListener(eventType, handleKeyboard);

    return () => {
      targetElement.removeEventListener(eventType, handleKeyboard);
    };
  }, [handler, target, eventType]);
}
