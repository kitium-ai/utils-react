import { useCallback, useEffect, useState } from 'react';

import { isBrowser } from '../../utils/ssr.js';

type NetworkInformation = {
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
  type?: string;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
};

/**
 * Network state interface
 */
export type NetworkState = {
  online: boolean;
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
  type?: string;
};

/**
 * Hook that tracks the state of browser's network connection
 *
 * @returns Network state
 *
 * @example
 * ```tsx
 * const network = useNetworkState();
 *
 * return (
 *   <div>
 *     <p>Online: {network.online ? 'Yes' : 'No'}</p>
 *     {network.effectiveType && <p>Effective type: {network.effectiveType}</p>}
 *     {network.downlink && <p>Downlink: {network.downlink} Mbps</p>}
 *     {network.rtt && <p>RTT: {network.rtt} ms</p>}
 *   </div>
 * );
 * ```
 */

export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    online: isBrowser() ? navigator.onLine : true,
  });

  // eslint-disable-next-line complexity -- Network API wiring includes multiple event sources and vendor support.
  const updateNetworkState = useCallback((): void => {
    if (!isBrowser()) {
      return;
    }

    const navigator_ = navigator as NavigatorWithConnection;
    const connection =
      navigator_.connection ?? navigator_.mozConnection ?? navigator_.webkitConnection;

    const nextState: NetworkState = {
      online: navigator.onLine,
    };

    if (connection?.downlink !== undefined) {
      nextState.downlink = connection.downlink;
    }
    if (connection?.downlinkMax !== undefined) {
      nextState.downlinkMax = connection.downlinkMax;
    }
    if (connection?.effectiveType !== undefined) {
      nextState.effectiveType = connection.effectiveType;
    }
    if (connection?.rtt !== undefined) {
      nextState.rtt = connection.rtt;
    }
    if (connection?.saveData !== undefined) {
      nextState.saveData = connection.saveData;
    }
    if (connection?.type !== undefined) {
      nextState.type = connection.type;
    }

    setState(nextState);
  }, []);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    updateNetworkState();

    const handleOnline = (): void => {
      setState((previousState) => ({ ...previousState, online: true }));
    };

    const handleOffline = (): void => {
      setState((previousState) => ({ ...previousState, online: false }));
    };

    const handleConnectionChange = (): void => {
      updateNetworkState();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    const navigator_ = navigator as NavigatorWithConnection;
    const connection =
      navigator_.connection ?? navigator_.mozConnection ?? navigator_.webkitConnection;

    connection?.addEventListener?.('change', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      connection?.removeEventListener?.('change', handleConnectionChange);
    };
  }, [updateNetworkState]);

  return state;
}
