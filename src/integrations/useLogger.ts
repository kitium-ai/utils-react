/**
 * React Logger Hook
 * Provides React hooks for @kitiumai/logger 2.0 integration
 */

import { useEffect, useRef, useMemo } from 'react';
import { createLogger, getLogger, type ILogger } from '@kitiumai/logger';

/**
 * React hook to get or create a logger instance
 * Memoized to prevent recreation on each render
 */
export function useLogger(_name: string): ILogger {
  const logger = useMemo(() => {
    const existing = getLogger();
    if (existing) {
      return existing;
    }
    return createLogger('production');
  }, []);

  return logger;
}

/**
 * Hook to log component lifecycle events
 */
export function useComponentLogger(componentName: string): {
  logMount: () => void;
  logUnmount: () => void;
  logUpdate: (props?: Record<string, unknown>) => void;
  logError: (error: Error, errorInfo?: Record<string, unknown>) => void;
} {
  const logger = useLogger(componentName);
  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current += 1;
  });

  return useMemo(
    () => ({
      logMount: () => {
        logger.debug(`${componentName} mounted`, {
          timestamp: new Date().toISOString(),
        });
      },

      logUnmount: () => {
        const lifetime = Date.now() - mountTimeRef.current;
        logger.debug(`${componentName} unmounted`, {
          lifetime,
          renderCount: renderCountRef.current,
        });
      },

      logUpdate: (props?: Record<string, unknown>) => {
        logger.debug(`${componentName} updated`, {
          renderCount: renderCountRef.current,
          props,
        });
      },

      logError: (error: Error, errorInfo?: Record<string, unknown>) => {
        logger.error(`${componentName} error`, {
          error: error.message,
          stack: error.stack,
          ...errorInfo,
        });
      },
    }),
    [componentName, logger]
  );
}

/**
 * Hook to automatically log component mount and unmount
 */
export function useLifecycleLogger(componentName: string): void {
  const { logMount, logUnmount } = useComponentLogger(componentName);

  useEffect(() => {
    logMount();
    return () => {
      logUnmount();
    };
  }, [logMount, logUnmount]);
}

/**
 * Hook to log performance metrics
 */
export function usePerformanceLogger(
  operationName: string
): (operation: () => void) => void {
  const logger = useLogger('performance');
  const getNow =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? () => performance.now()
      : () => Date.now();

  return useMemo(
    () => (operation: () => void) => {
      const start = getNow();
      try {
        operation();
      } finally {
        const duration = getNow() - start;
        logger.debug(`Performance: ${operationName}`, {
          duration,
          unit: 'ms',
        });
      }
    },
    [getNow, logger, operationName]
  );
}

