import { useEffect, useRef, useState } from 'react';

/**
 * Hook that returns whether the component is currently mounted
 *
 * @returns True if component is mounted, false otherwise
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const isMounted = useMountedState();
 *   const [data, setData] = useState(null);
 *
 *   useEffect(() => {
 *     fetchData().then((result) => {
 *       if (isMounted()) {
 *         setData(result);
 *       }
 *     });
 *   }, []);
 * };
 * ```
 */
export function useMountedState(): () => boolean {
  const mountedReference = useRef(false);
  const [, setState] = useState(false);

  useEffect(() => {
    mountedReference.current = true;
    setState(true);
    return () => {
      mountedReference.current = false;
    };
  }, []);

  return () => mountedReference.current;
}
