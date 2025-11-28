import type { DependencyList,EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

/**
 * Hook that runs an effect but skips the first render
 *
 * @param effect - Effect callback
 * @param deps - Dependency array
 *
 * @example
 * ```tsx
 * const Component = ({ value }: { value: string }) => {
 *   useUpdateEffect(() => {
 *     console.log('Value changed:', value); // Won't run on mount
 *   }, [value]);
 *   return <div>{value}</div>;
 * };
 * ```
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
  }, deps);
}
