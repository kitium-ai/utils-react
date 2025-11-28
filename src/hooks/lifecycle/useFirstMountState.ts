import { useRef } from 'react';

/**
 * Hook that returns true only on the first render
 *
 * @returns True if this is the first render, false otherwise
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const isFirstMount = useFirstMountState();
 *   return <div>{isFirstMount ? 'First render' : 'Subsequent renders'}</div>;
 * };
 * ```
 */
export function useFirstMountState(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}
