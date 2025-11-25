import { useEffect, useState } from 'react';

/**
 * Script loading state
 */
export interface ScriptState {
  loading: boolean;
  error: Error | null;
  ready: boolean;
}

/**
 * Hook that loads a script dynamically
 *
 * @param src - Script source URL
 * @param options - Script loading options
 * @returns Script loading state
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const { loading, error, ready } = useScript('https://example.com/script.js');
 *   if (loading) return <div>Loading script...</div>;
 *   if (error) return <div>Error loading script</div>;
 *   return <div>Script ready</div>;
 * };
 * ```
 */
export function useScript(
  src: string,
  options: { async?: boolean; defer?: boolean } = {}
): ScriptState {
  const [state, setState] = useState<ScriptState>({
    loading: true,
    error: null,
    ready: false,
  });

  useEffect(() => {
    if (!src) {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = options.async ?? true;
    script.defer = options.defer ?? false;

    const handleLoad = () => {
      setState({ loading: false, error: null, ready: true });
    };

    const handleError = () => {
      setState({
        loading: false,
        error: new Error(`Failed to load script: ${src}`),
        ready: false,
      });
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      document.body.removeChild(script);
    };
  }, [src, options.async, options.defer]);

  return state;
}

