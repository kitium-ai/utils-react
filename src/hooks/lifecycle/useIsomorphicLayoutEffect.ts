import { useEffect, useLayoutEffect } from 'react';
import type { EffectCallback, DependencyList } from 'react';

/**
 * SSR-safe version of useLayoutEffect
 * Falls back to useEffect on the server
 *
 * @param effect - Effect callback
 * @param deps - Dependency array
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   useIsomorphicLayoutEffect(() => {
 *     // Safe to use in SSR
 *   }, []);
 * };
 * ```
 */
export function useIsomorphicLayoutEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  if (typeof window === 'undefined') {
    useEffect(effect, deps);
  } else {
    useLayoutEffect(effect, deps);
  }
}

