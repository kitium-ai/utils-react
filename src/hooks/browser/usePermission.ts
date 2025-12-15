import { useCallback, useEffect, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';
import { isBrowser } from '../../utils/ssr.js';

/**
 * Permission state
 */
export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * Hook that queries permission status for browser APIs
 *
 * @param permissionName - Name of the permission to query
 * @returns Permission state and query function
 *
 * @example
 * ```tsx
 * const { state, query } = usePermission('geolocation');
 *
 * return (
 *   <div>
 *     <p>Geolocation permission: {state}</p>
 *     <button onClick={query}>Check Permission</button>
 *   </div>
 * );
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- Permission API wiring includes async query + listeners.
export function usePermission(permissionName: PermissionName): {
  state: PermissionState;
  query: () => Promise<PermissionState>;
  supported: boolean;
} {
  const [state, setState] = useState<PermissionState>('unknown');
  const [supported, setSupported] = useState<boolean>(false);

  const query = useCallback(async (): Promise<PermissionState> => {
    if (!isBrowser() || !navigator.permissions) {
      setSupported(false);
      setState('unknown');
      return 'unknown';
    }

    try {
      const permission = await navigator.permissions.query({ name: permissionName });
      setSupported(true);
      setState(permission.state as PermissionState);
      return permission.state as PermissionState;
    } catch (error) {
      logHookError(
        'usePermission',
        'Permission query failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          permissionName,
        }
      );
      setSupported(false);
      setState('unknown');
      return 'unknown';
    }
  }, [permissionName]);

  useEffect(() => {
    void query();
  }, [query]);

  // Listen for permission changes
  useEffect(() => {
    if (!isBrowser() || !navigator.permissions) {
      return;
    }

    let permissionStatus: PermissionStatus;

    const setupListener = async (): Promise<void> => {
      try {
        permissionStatus = await navigator.permissions.query({ name: permissionName });
        permissionStatus.addEventListener('change', () => {
          setState(permissionStatus.state as PermissionState);
        });
      } catch {
        // Ignore errors in setting up listener
      }
    };

    void setupListener();

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', () => {
          setState(permissionStatus.state as PermissionState);
        });
      }
    };
  }, [permissionName]);

  return {
    state,
    query,
    supported,
  };
}
