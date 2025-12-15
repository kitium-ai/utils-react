import { useEffect } from 'react';

/**
 * Options for useKeyboard hook
 */
export type UseKeyboardOptions = {
  target?: 'window' | 'document' | HTMLElement;
  event?: 'keydown' | 'keyup' | 'keypress';
};

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
    const targetElement: Window | Document | HTMLElement = (() => {
      if (target === 'window') {
        return window;
      }
      if (target === 'document') {
        return document;
      }
      return target;
    })();

    const handleKeyboard = (event: Event): void => {
      handler(event as KeyboardEvent);
    };

    targetElement.addEventListener(eventType, handleKeyboard);

    return () => {
      targetElement.removeEventListener(eventType, handleKeyboard);
    };
  }, [handler, target, eventType]);
}
