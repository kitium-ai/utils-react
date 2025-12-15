import { useCallback, useEffect, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';
import { isBrowser } from '../../utils/ssr.js';

/**
 * Vibration pattern type
 */
export type VibrationPattern = number | number[];

/**
 * Vibration state
 */
export type VibrationState = {
  isSupported: boolean;
  isVibrating: boolean;
};

type UseVibrateReturn = VibrationState & {
  vibrate: (pattern: VibrationPattern) => boolean;
  stop: () => void;
};

/**
 * Hook that provide physical feedback using the Vibration API
 *
 * @returns Vibration state and control functions
 *
 * @example
 * ```tsx
 * const { supported, vibrate } = useVibrate();
 *
 * return (
 *   <div>
 *     {supported ? (
 *       <button onClick={() => vibrate(200)}>
 *         Vibrate for 200ms
 *       </button>
 *     ) : (
 *       <p>Vibration not supported</p>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useVibrate(): UseVibrateReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isVibrating, setIsVibrating] = useState<boolean>(false);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    setIsSupported('vibrate' in navigator);
  }, []);

  const vibrate = useCallback(
    (pattern: VibrationPattern): boolean => {
      if (!isSupported || !isBrowser()) {
        return false;
      }

      try {
        const isSuccess = navigator.vibrate(pattern);
        if (isSuccess) {
          setIsVibrating(true);
          // Reset vibrating state after pattern completes
          const duration = Array.isArray(pattern)
            ? pattern.reduce((sum, number_) => sum + number_, 0)
            : pattern;
          setTimeout(() => setIsVibrating(false), duration);
        }
        return isSuccess;
      } catch (error) {
        logHookError(
          'useVibrate',
          'Vibration failed',
          error instanceof Error ? error : new Error(String(error))
        );
        return false;
      }
    },
    [isSupported]
  );

  const stop = useCallback((): void => {
    if (!isSupported || !isBrowser()) {
      return;
    }

    navigator.vibrate(0);
    setIsVibrating(false);
  }, [isSupported]);

  return {
    isSupported,
    isVibrating,
    vibrate,
    stop,
  };
}
