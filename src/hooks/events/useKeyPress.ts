import { useEffect } from 'react';

/**
 * Hook that detects when a specific key is pressed
 *
 * @param targetKey - The key to detect (e.g., 'Enter', 'Escape', 'a')
 * @param handler - Function to call when key is pressed
 * @param options - Options for key press handling
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   useKeyPress('Escape', () => {
 *     console.log('Escape pressed');
 *   });
 *   return <div>Press Escape</div>;
 * };
 * ```
 */
export function useKeyPress(
  targetKey: string,
  handler: (event: KeyboardEvent) => void,
  options: { event?: 'keydown' | 'keyup' } = {}
): void {
  const { event: eventType = 'keydown' } = options;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.key === targetKey) {
        handler(event);
      }
    };

    window.addEventListener(eventType, handleKeyPress);
    return () => window.removeEventListener(eventType, handleKeyPress);
  }, [targetKey, handler, eventType]);
}
