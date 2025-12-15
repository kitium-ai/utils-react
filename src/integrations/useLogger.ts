/**
 * React Logger Hooks
 * Uses @kitiumai/logger 3.x and @kitiumai/utils-ts logger integrations
 */

import { createLogger, getLogger, type ILogger } from '@kitiumai/logger';
import { createPerformanceLogger } from '@kitiumai/utils-ts';
import { useEffect, useMemo, useRef } from 'react';

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
    // Fallback to a production preset logger when no global logger is initialized
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
  const mountTimeReference = useRef<number>(Date.now());
  const renderCountReference = useRef<number>(0);

  useEffect(() => {
    renderCountReference.current += 1;
  });

  return useMemo(
    () => ({
      logMount: () => {
        logger.debug(`${componentName} mounted`, {
          timestamp: new Date().toISOString(),
        });
      },

      logUnmount: () => {
        const lifetime = Date.now() - mountTimeReference.current;
        logger.debug(`${componentName} unmounted`, {
          lifetime,
          renderCount: renderCountReference.current,
        });
      },

      logUpdate: (props?: Record<string, unknown>) => {
        logger.debug(`${componentName} updated`, {
          renderCount: renderCountReference.current,
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
 * Delegates timing to @kitiumai/utils-ts logger integration
 */
export function usePerformanceLogger(operationName: string): (operation: () => void) => void {
  const performanceLogger = useMemo(() => createPerformanceLogger('react'), []);

  return useMemo(
    () => (operation: () => void) => {
      performanceLogger.measure(operationName, operation);
    },
    [operationName, performanceLogger]
  );
}
