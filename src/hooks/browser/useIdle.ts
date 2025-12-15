import { useCallback, useEffect, useRef, useState } from 'react';

import { isBrowser } from '../../utils/ssr.js';

/**
 * Idle state
 */
export type IdleState = {
  isIdle: boolean;
  lastActive: number;
  timeSinceLastActive: number;
};

/**
 * Hook that tracks whether user is being inactive
 *
 * @param timeout - Idle timeout in milliseconds (default: 300000 = 5 minutes)
 * @param events - Events to listen for activity (default: common user events)
 * @returns Idle state and reset function
 *
 * @example
 * ```tsx
 * const { isIdle, lastActive, reset } = useIdle(60000); // 1 minute timeout
 *
 * return (
 *   <div>
 *     <p>User is {isIdle ? 'idle' : 'active'}</p>
 *     <p>Last active: {new Date(lastActive).toLocaleTimeString()}</p>
 *     <button onClick={reset}>Reset Idle Timer</button>
 *   </div>
 * );
 * ```
 */
export function useIdle(
  timeout = 300000,
  events: string[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
): IdleState & { reset: () => void } {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [lastActive, setLastActive] = useState<number>(Date.now());
  const timeoutId = useRef<NodeJS.Timeout>();

  const reset = useCallback((): void => {
    setIsIdle(false);
    setLastActive(Date.now());
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      setIsIdle(true);
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const handleActivity = (): void => {
      reset();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the idle timer
    reset();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimeout(timeoutId.current);
    };
  }, [events, reset]);

  const timeSinceLastActive = Date.now() - lastActive;

  return {
    isIdle,
    lastActive,
    timeSinceLastActive,
    reset,
  };
}
