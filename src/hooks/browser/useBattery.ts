import { useCallback, useEffect, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';
import { isBrowser } from '../../utils/ssr.js';

/**
 * Battery manager interface
 */
export type BatteryManager = {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
};

/**
 * Battery state
 */
export type BatteryState = {
  supported: boolean;
  loading: boolean;
  battery: BatteryManager | null;
};

/**
 * Hook that tracks device battery state
 *
 * @returns Battery state
 *
 * @example
 * ```tsx
 * const { supported, loading, battery } = useBattery();
 *
 * if (!supported) {
 *   return <div>Battery API not supported</div>;
 * }
 *
 * return (
 *   <div>
 *     {loading ? (
 *       <div>Loading battery info...</div>
 *     ) : (
 *       <div>
 *         <p>Level: {Math.round(battery!.level * 100)}%</p>
 *         <p>Charging: {battery!.charging ? 'Yes' : 'No'}</p>
 *         <p>Charging time: {battery!.chargingTime}</p>
 *         <p>Discharging time: {battery!.dischargingTime}</p>
 *       </div>
 *     )}
 *   </div>
 * );
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- Battery API wiring includes multiple event handlers.
export function useBattery(): BatteryState {
  const [state, setState] = useState<BatteryState>({
    supported: false,
    loading: true,
    battery: null,
  });

  const updateBattery = useCallback((battery: BatteryManager): void => {
    setState({
      supported: true,
      loading: false,
      battery: {
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        level: battery.level,
      },
    });
  }, []);

  const handleBatteryError = useCallback((error: unknown): void => {
    logHookError(
      'useBattery',
      'Battery API error',
      error instanceof Error ? error : new Error(String(error))
    );
    setState((previousState) => ({
      ...previousState,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    if (!isBrowser()) {
      setState({
        supported: false,
        loading: false,
        battery: null,
      });
      return;
    }

    // Check if Battery API is supported
    if (!('getBattery' in navigator)) {
      setState({
        supported: false,
        loading: false,
        battery: null,
      });
      return;
    }

    let battery: BatteryManager;

    const getBattery = async (): Promise<void> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        battery = await (navigator as any).getBattery();

        updateBattery(battery);

        // Listen for battery changes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (battery as any).addEventListener('chargingchange', () => updateBattery(battery));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (battery as any).addEventListener('chargingtimechange', () => updateBattery(battery));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (battery as any).addEventListener('dischargingtimechange', () => updateBattery(battery));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (battery as any).addEventListener('levelchange', () => updateBattery(battery));
      } catch (error) {
        handleBatteryError(error);
      }
    };

    void getBattery();

    return () => {
      if (battery) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (battery as any).removeEventListener('chargingchange', () => updateBattery(battery));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (battery as any).removeEventListener('chargingtimechange', () => updateBattery(battery));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (battery as any).removeEventListener('dischargingtimechange', () => updateBattery(battery));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (battery as any).removeEventListener('levelchange', () => updateBattery(battery));
      }
    };
  }, [updateBattery, handleBatteryError]);

  return state;
}
