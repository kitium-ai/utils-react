import {
  Component,
  createElement,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useState,
} from 'react';

/**
 * Error boundary state
 */
export type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

/**
 * Hook for managing error boundary state
 *
 * @param fallback - Fallback component or render function
 * @returns Error boundary component and reset function
 *
 * @example
 * ```tsx
 * const ErrorBoundary = ({ children }: { children: ReactNode }) => {
 *   const [errorBoundary, resetError] = useErrorBoundary(
 *     ({ error, reset }) => (
 *       React.createElement('div', null,
 *         React.createElement('h1', null, 'Something went wrong'),
 *         React.createElement('p', null, error?.message),
 *         React.createElement('button', { onClick: reset }, 'Try again')
 *       )
 *     )
 *   );
 *
 *   return errorBoundary(children);
 * };
 * ```
 */
export function useErrorBoundary(
  fallback: (props: { error: Error | null; reset: () => void }) => ReactNode
): [(children: ReactNode) => ReactNode, () => void] {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  const resetError = useCallback((): void => {
    setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }, []);

  const errorBoundaryComponent = useCallback(
    (children: ReactNode): ReactNode => {
      if (state.hasError) {
        return fallback({ error: state.error, reset: resetError });
      }

      return createElement(ErrorBoundaryInner, {
        onError: (error: Error, errorInfo: ErrorInfo) => {
          setState({
            hasError: true,
            error,
            errorInfo,
          });
        },
        children,
      });
    },
    [state.hasError, state.error, resetError, fallback]
  );

  return [errorBoundaryComponent, resetError];
}

/**
 * Internal error boundary component
 */
type ErrorBoundaryInnerProperties = {
  children: ReactNode;
  onError: (error: Error, errorInfo: ErrorInfo) => void;
};

class ErrorBoundaryInner extends Component<ErrorBoundaryInnerProperties> {
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError(error, errorInfo);
  }

  override render(): ReactNode {
    return this.props.children;
  }
}
