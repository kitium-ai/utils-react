import { useEffect } from 'react';

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
 */
export function useTitle(title: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

