import { useCallback, useEffect, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';
import { isBrowser } from '../../utils/ssr.js';

/**
 * Geolocation position interface
 */
export type GeolocationPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
};

/**
 * Geolocation coordinates
 */
type GeolocationCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
};

/**
 * DOM Geolocation position
 */
type DOMGeolocationPosition = {
  coords: GeolocationCoordinates;
  timestamp: number;
};

/**
 * Convert DOM position to our interface
 */
function convertPosition(domPosition: DOMGeolocationPosition): GeolocationPosition {
  return {
    latitude: domPosition.coords.latitude,
    longitude: domPosition.coords.longitude,
    accuracy: domPosition.coords.accuracy,
    altitude: domPosition.coords.altitude,
    altitudeAccuracy: domPosition.coords.altitudeAccuracy,
    heading: domPosition.coords.heading,
    speed: domPosition.coords.speed,
    timestamp: domPosition.timestamp,
  };
}

/**
 * Geolocation error interface
 */
export type GeolocationError = {
  code: number;
  message: string;
  permissionDenied: 1;
  positionUnavailable: 2;
  timeout: 3;
};

const GEOLOCATION_ERROR_CODES = {
  permissionDenied: 1,
  positionUnavailable: 2,
  timeout: 3,
} as const satisfies Pick<GeolocationError, 'permissionDenied' | 'positionUnavailable' | 'timeout'>;

/**
 * Hook options
 */
export type UseGeolocationOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
};

/**
 * Hook return value
 */
export type UseGeolocationReturn = {
  position: GeolocationPosition | null;
  loading: boolean;
  error: GeolocationError | null;
  getCurrentPosition: () => void;
  watchId: number | null;
};

/**
 * Geolocation state
 */
export type GeolocationState = {
  loading: boolean;
  position: GeolocationPosition | null;
  error: GeolocationError | null;
};

/**
 * Hook that tracks geo location state of user's device
 *
 * @param options - Geolocation options
 * @returns Geolocation state and control functions
 *
 * @example
 * ```tsx
 * const { loading, position, error, getCurrentPosition } = useGeolocation({
 *   enableHighAccuracy: true,
 *   timeout: 10000,
 *   maximumAge: 300000,
 * });
 *
 * return (
 *   <div>
 *     {loading && <p>Loading location...</p>}
 *     {error && <p>Error: {error.message}</p>}
 *     {position && (
 *       <p>
 *         Latitude: {position.latitude}, Longitude: {position.longitude}
 *       </p>
 *     )}
 *     <button onClick={getCurrentPosition}>Get Current Position</button>
 *   </div>
 * );
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- Geolocation includes multiple control methods and state transitions.
export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    position: null,
    error: null,
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  const updatePosition = useCallback((domPosition: DOMGeolocationPosition): void => {
    setState({
      loading: false,
      position: convertPosition(domPosition),
      error: null,
    });
  }, []);

  const updateError = useCallback((error: GeolocationPositionError): void => {
    setState((previousState) => ({
      ...previousState,
      loading: false,
      error: {
        code: error.code,
        message: error.message,
        ...GEOLOCATION_ERROR_CODES,
      },
    }));
    logHookError('useGeolocation', 'Geolocation error', new Error(error.message), {
      code: error.code,
    });
  }, []);

  const getCurrentPosition = useCallback((): void => {
    if (!isBrowser() || !navigator.geolocation) {
      setState((previousState) => ({
        ...previousState,
        loading: false,
        error: {
          code: 2,
          message: 'Geolocation is not supported',
          ...GEOLOCATION_ERROR_CODES,
        },
      }));
      return;
    }

    setState((previousState) => ({ ...previousState, loading: true }));

    navigator.geolocation.getCurrentPosition(updatePosition, updateError, options);
  }, [options, updatePosition, updateError]);

  const watchPosition = useCallback((): void => {
    if (!isBrowser() || !navigator.geolocation) {
      setState((previousState) => ({
        ...previousState,
        loading: false,
        error: {
          code: 2,
          message: 'Geolocation is not supported',
          ...GEOLOCATION_ERROR_CODES,
        },
      }));
      return;
    }

    setState((previousState) => ({ ...previousState, loading: true }));

    const id = navigator.geolocation.watchPosition(updatePosition, updateError, options);
    setWatchId(id);
  }, [options, updatePosition, updateError]);

  const clearWatch = useCallback((): void => {
    if (watchId !== null && isBrowser() && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Auto-watch if enabled
  useEffect(() => {
    if (options.watch) {
      watchPosition();
      return clearWatch;
    }
    return;
  }, [options.watch, watchPosition, clearWatch]);

  return {
    position: state.position,
    loading: state.loading,
    error: state.error,
    getCurrentPosition,
    watchId,
  };
}
