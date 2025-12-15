import { type DependencyList, type EffectCallback, useEffect, useLayoutEffect } from 'react';

// eslint-disable-next-line no-restricted-imports -- Internal package utility
import { isBrowser } from '../../utils/ssr.js';

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
export function useIsomorphicLayoutEffect(effect: EffectCallback, deps?: DependencyList): void {
  if (!isBrowser()) {
    useEffect(effect, deps);
  } else {
    useLayoutEffect(effect, deps);
  }
}
