import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Options for IntersectionObserver
 */
export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Hook that tracks element intersection with viewport
 *
 * @template T - The type of the HTML element
 * @param options - IntersectionObserver options
 * @returns Tuple of [ref, isIntersecting]
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.5 });
 *   return <div ref={ref}>{isVisible ? 'Visible' : 'Hidden'}</div>;
 * };
 * ```
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const reference = useRef<T>(null);
  const [element, setElement] = useState<T | null>(null);

  // Check ref.current on each render to detect element attachment
  if (reference.current !== element) {
    setElement(reference.current);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsIntersecting(entry.isIntersecting);

        if (options.freezeOnceVisible && entry.isIntersecting) {
          observer.disconnect();
        }
      }
    }, options);

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [element, options.threshold, options.root, options.rootMargin, options.freezeOnceVisible]);

  return [reference, isIntersecting];
}
