import { useLayoutEffect, useRef } from 'react';
import type { EffectCallback, DependencyList } from 'react';

/**
 * Hook that runs a layout effect but skips the first render
 *
 * @param effect - Effect callback
 * @param deps - Dependency array
 *
 * @example
 * ```tsx
 * const Component = ({ value }: { value: string }) => {
 *   useUpdateLayoutEffect(() => {
 *     // Measure DOM after value changes (but not on mount)
 *   }, [value]);
 *   return <div>{value}</div>;
 * };
 * ```
 */
export function useUpdateLayoutEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  const isFirst = useRef(true);

  useLayoutEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
  }, deps);
}

