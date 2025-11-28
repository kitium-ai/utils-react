import { useEffect, useRef } from 'react';

/**
 * Hook that runs a function on component unmount
 *
 * @param fn - Function to run on unmount
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   useUnmount(() => {
 *     console.log('Component unmounted');
 *   });
 *   return <div>Content</div>;
 * };
 * ```
 */
export function useUnmount(function_: () => void): void {
  const functionReference = useRef(function_);
  functionReference.current = function_;

  useEffect(() => {
    return () => {
      functionReference.current();
    };
  }, []);
}
