import { useEffect } from 'react';

import { isDOMAvailable } from '../../utils/ssr';

/**
 * Hook that sets the document title
 *
 * @param title - The title to set
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   useTitle('My Page Title');
 *   return <div>Content</div>;
 * };
 * ```
 *
 * @remarks
 * SSR-safe: This hook checks for DOM availability before attempting to set the title.
 * In server-side rendering environments, the hook will safely return without errors.
 */
export function useTitle(title: string): void {
  useEffect(() => {
    if (!isDOMAvailable()) {
      return;
    }

    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
