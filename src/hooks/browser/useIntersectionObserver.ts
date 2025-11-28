import { useEffect, useState } from 'react';
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
 * @param ref - Ref object attached to the element
 * @param options - IntersectionObserver options
 * @returns IntersectionObserverEntry or null
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const entry = useIntersectionObserver(ref, { threshold: 0.5 });
 *   const isVisible = entry?.isIntersecting ?? false;
 *   return <div ref={ref}>{isVisible ? 'Visible' : 'Hidden'}</div>;
 * };
 * ```
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  options: UseIntersectionObserverOptions = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setEntry(entry);

        if (options.freezeOnceVisible && entry.isIntersecting) {
          observer.disconnect();
        }
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold, options.root, options.rootMargin, options.freezeOnceVisible]);

  return entry;
}

