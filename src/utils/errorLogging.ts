/**
 * Centralized error logging utilities for hooks
 *
 * Provides structured error and warning logging with fallback to console
 */

/**
 * Log a hook warning with context
 *
 * @param hookName - Name of the hook where the warning occurred
 * @param message - Warning message
 * @param context - Optional context object for additional details
 */
export function logHookWarning(
  hookName: string,
  message: string,
  context?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') {
    // Skip logging in SSR environments
    return;
  }

  // Format the message
  const formattedMessage = `[${hookName}] ${message}`;

  // Try to use @kitiumai/logger if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { logger } = require('@kitiumai/logger');
    if (logger?.warn) {
      logger.warn(formattedMessage, context);
      return;
    }
  } catch {
    // Logger not available, fall through to console
  }

  // Fallback to console.warn
  if (context) {
    console.warn(formattedMessage, context);
  } else {
    console.warn(formattedMessage);
  }
}

/**
 * Log a hook error with context
 *
 * @param hookName - Name of the hook where the error occurred
 * @param message - Error message
 * @param error - The error object
 * @param context - Optional context object for additional details
 */
export function logHookError(
  hookName: string,
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') {
    // Skip logging in SSR environments
    return;
  }

  // Format the message
  const formattedMessage = `[${hookName}] ${message}`;

  // Try to use @kitiumai/logger if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { logger } = require('@kitiumai/logger');
    if (logger?.error) {
      logger.error(formattedMessage, { error, ...context });
      return;
    }
  } catch {
    // Logger not available, fall through to console
  }

  // Fallback to console.error
  console.error(formattedMessage, error, context);
}
