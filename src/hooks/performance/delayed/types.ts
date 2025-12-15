/**
 * Delayed callback types (debounce, throttle, and shared infrastructure)
 */

/**
 * Any callable function type
 */
export type AnyCallable = (...args: unknown[]) => unknown;

/**
 * Enhanced function with cancel, flush, and isPending methods
 */
export type DelayedFunction<T extends AnyCallable> = T & {
  /**
   * Cancel pending or pending invocation
   */
  cancel: () => void;

  /**
   * Immediately invoke pending arguments if any
   */
  flush: () => void;

  /**
   * Check if there are pending arguments waiting to be invoked
   */
  isPending: () => boolean;
};

/**
 * Mode for delayed callback execution
 */
export type DelayMode = 'debounce' | 'throttle';

/**
 * Configuration for creating delayed callbacks
 */
export type DelayedCallbackConfig = {
  /**
   * Delay mode: 'debounce' or 'throttle'
   */
  mode: DelayMode;

  /**
   * Delay in milliseconds
   */
  delay: number;

  /**
   * For debounce: invoke on leading edge instead of trailing
   * For throttle: invoke immediately on first call
   * @default false for debounce, true for throttle
   */
  leading?: boolean;

  /**
   * For debounce: invoke on trailing edge (when last call is made)
   * For throttle: invoke on trailing edge after delay
   * @default true
   */
  trailing?: boolean;

  /**
   * For debounce: maximum wait time between invocations
   * For throttle: not used
   * @default Infinity
   */
  maxWait?: number;
};
