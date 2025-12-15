import { useEffect, useState } from 'react';

/**
 * Mouse position
 */
export type MousePosition = {
  x: number;
  y: number;
};

/**
 * Hook that tracks mouse position
 *
 * @returns Current mouse position
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const { x, y } = useMouse();
 *   return <div>Mouse: {x}, {y}</div>;
 * };
 * ```
 */
export function useMouse(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent): void => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}
