import { useCallback, useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * Hook that returns a function to force a re-render
 *
 * @returns Function to force re-render
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const update = useUpdate();
 *   return <button onClick={update}>Force Update</button>;
 * };
 * ```
 */
export function useUpdate(): () => void {
  const [, setState] = useState({});

  return useCallback(() => {
    flushSync(() => {
      setState({});
    });
  }, []);
}
