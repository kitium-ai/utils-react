import { type RefObject, useEffect, useRef, useState } from 'react';

/**
 * Options for IntersectionObserver
 */
export type UseIntersectionObserverOptions = {
  freezeOnceVisible?: boolean;
} & IntersectionObserverInit;

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
  const { freezeOnceVisible, threshold, root, rootMargin } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const reference = useRef<T>(null);
  const [element, setElement] = useState<T | null>(null);

  // Check ref.current on each render to detect element attachment
  if (reference.current !== element) {
    setElement(reference.current);
  }

  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {};

    if (threshold !== undefined) {
      observerOptions.threshold = threshold;
    }
    if (root !== undefined) {
      observerOptions.root = root;
    }
    if (rootMargin !== undefined) {
      observerOptions.rootMargin = rootMargin;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsIntersecting(entry.isIntersecting);

        if (freezeOnceVisible && entry.isIntersecting) {
          observer.disconnect();
        }
      }
    }, observerOptions);

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [element, threshold, root, rootMargin, freezeOnceVisible]);

  return [reference, isIntersecting];
}
