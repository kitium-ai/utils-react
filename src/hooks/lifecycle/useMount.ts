import { useEffect } from 'react';

/**
 * Hook that runs a function on component mount
 *
 * @param fn - Function to run on mount
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   useMount(() => {
 *     console.log('Component mounted');
 *   });
 *   return <div>Content</div>;
 * };
 * ```
 */
export function useMount(fn: () => void): void {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

