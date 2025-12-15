import { type MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';

/**
 * Request options for useRequest hook
 */
export type UseRequestOptions<TData, TParameters extends unknown[]> = {
  /** Whether to execute automatically on mount */
  manual?: boolean;
  /** Default parameters for the request */
  defaultParams?: TParameters;
  /** Refresh dependencies - triggers re-execution when changed */
  refreshDeps?: unknown[];
  /** Cache key for request deduplication */
  cacheKey?: string;
  /** Cache time in milliseconds */
  cacheTime?: number;
  /** Whether to refresh on window focus */
  refreshOnWindowFocus?: boolean;
  /** Focus throttle time in milliseconds */
  focusThrottleWait?: number;
  /** Whether to refresh on network reconnect */
  refreshOnReconnect?: boolean;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Whether to stop polling when error occurs */
  pollingWhenHidden?: boolean;
  /** Loading delay in milliseconds */
  loadingDelay?: number;
  /** Retry configuration */
  retry?: {
    count?: number;
    delay?: number | ((attempt: number) => number);
  };
  /** Request debounce delay in milliseconds */
  debounceWait?: number;
  /** Request throttle delay in milliseconds */
  throttleWait?: number;
  /** Ready state - only execute when true */
  ready?: boolean;
  /** onBefore callback */
  onBefore?: (parameters: TParameters) => void;
  /** onSuccess callback */
  onSuccess?: (data: TData, parameters: TParameters) => void;
  /** onError callback */
  onError?: (error: Error, parameters: TParameters) => void;
  /** onFinally callback */
  onFinally?: (parameters: TParameters, data?: TData, error?: Error) => void;
};

/**
 * Request result interface
 */
export type UseRequestResult<TData, TParameters extends unknown[]> = {
  /** Response data */
  data: TData | undefined;
  /** Loading state */
  loading: boolean;
  /** Error object */
  error: Error | undefined;
  /** Request parameters */
  params: TParameters | undefined;
  /** Execute the request manually */
  run: (...parameters: TParameters) => void;
  /** Execute the request with previous params */
  runAsync: (...parameters: TParameters) => Promise<TData>;
  /** Refresh the request */
  refresh: () => void;
  /** Refresh asynchronously */
  refreshAsync: () => Promise<TData>;
  /** Cancel the current request */
  cancel: () => void;
  /** Mute the current request (don't trigger state updates) */
  mutate: (data: TData | ((oldData: TData | undefined) => TData)) => void;
};

/**
 * Global request cache
 */
const requestCache = new Map<
  string,
  {
    data: unknown;
    timestamp: number;
    promise?: Promise<unknown>;
  }
>();

/**
 * Global request deduplication
 */
const requestDedup = new Map<string, Promise<unknown>>();

type RetryConfig = NonNullable<UseRequestOptions<unknown, unknown[]>['retry']>;

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getCacheKeyValue(cacheKey: string | undefined, parameters: unknown[]): string | undefined {
  if (!cacheKey) {
    return undefined;
  }
  return `${cacheKey}-${JSON.stringify(parameters)}`;
}

function getCachedData<TData>(
  cacheKeyValue: string | undefined,
  cacheTime: number
): TData | undefined {
  if (!cacheKeyValue) {
    return undefined;
  }

  const cached = requestCache.get(cacheKeyValue);
  if (!cached) {
    return undefined;
  }

  const isFresh = Date.now() - cached.timestamp < cacheTime;
  return isFresh ? (cached.data as TData) : undefined;
}

function getDedupPromise<TData>(cacheKeyValue: string | undefined): Promise<TData> | undefined {
  if (!cacheKeyValue) {
    return undefined;
  }
  return requestDedup.get(cacheKeyValue) as Promise<TData> | undefined;
}

function getRetryDelay(retry: RetryConfig, attempt: number): number {
  const delay = retry.delay;
  if (typeof delay === 'function') {
    return delay(attempt);
  }
  if (typeof delay === 'number') {
    return delay;
  }
  return Math.min(1000 * 2 ** (attempt - 1), 30000);
}

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

// eslint-disable-next-line max-lines-per-function -- Centralizes caching/dedup/retry behavior for `useRequest`.
async function executeWithRetry<TData, TParameters extends unknown[]>(
  service: (...args: TParameters) => Promise<TData>,
  requestParameters: TParameters,
  config: {
    cacheKeyValue?: string;
    cacheTime: number;
    isRefresh: boolean;
    retry: RetryConfig;
    onBefore?: (parameters: TParameters) => void;
    onSuccess?: (data: TData, parameters: TParameters) => void;
    onError?: (error: Error, parameters: TParameters) => void;
  }
): Promise<TData> {
  const cacheKeyValue = config.cacheKeyValue;
  const shouldCache = cacheKeyValue !== undefined && !config.isRefresh;

  if (!config.isRefresh) {
    const cached = getCachedData<TData>(cacheKeyValue, config.cacheTime);
    if (cached !== undefined) {
      return cached;
    }

    const dedupPromise = getDedupPromise<TData>(cacheKeyValue);
    if (dedupPromise) {
      return dedupPromise;
    }
  }

  const maxRetries = config.retry.count ?? 0;

  const attemptRequest = async (attempt: number): Promise<TData> => {
    config.onBefore?.(requestParameters);

    const promise = service(...requestParameters);
    if (shouldCache) {
      requestDedup.set(cacheKeyValue, promise as Promise<unknown>);
    }

    try {
      const result = await promise;

      if (shouldCache) {
        requestCache.set(cacheKeyValue, {
          data: result,
          timestamp: Date.now(),
        });
      }

      config.onSuccess?.(result, requestParameters);
      return result;
    } catch (error) {
      const errorObject = normalizeError(error);
      if (attempt < maxRetries) {
        await sleep(getRetryDelay(config.retry, attempt + 1));
        return attemptRequest(attempt + 1);
      }

      config.onError?.(errorObject, requestParameters);
      throw errorObject;
    } finally {
      if (shouldCache) {
        requestDedup.delete(cacheKeyValue);
      }
    }
  };

  return attemptRequest(0);
}

function scheduleDebounced(
  timerReference: MutableRefObject<ReturnType<typeof setTimeout> | undefined>,
  wait: number,
  run: () => void
): void {
  clearTimeout(timerReference.current);
  timerReference.current = setTimeout(run, wait);
}

function scheduleThrottled(
  timerReference: MutableRefObject<ReturnType<typeof setTimeout> | undefined>,
  lastRunTimeReference: MutableRefObject<number>,
  wait: number,
  run: () => void
): boolean {
  const now = Date.now();
  const timeSinceLastRun = now - lastRunTimeReference.current;

  if (timeSinceLastRun >= wait) {
    lastRunTimeReference.current = now;
    return false;
  }

  clearTimeout(timerReference.current);
  timerReference.current = setTimeout(() => {
    lastRunTimeReference.current = Date.now();
    run();
  }, wait - timeSinceLastRun);
  return true;
}

function useInitialExecution<TParameters extends unknown[]>(
  isManual: boolean,
  defaultParameters: TParameters | undefined,
  isReady: boolean,
  runRequest: (parameters: TParameters, isRefresh?: boolean) => void
): void {
  useEffect(() => {
    if (!isManual && defaultParameters && isReady) {
      runRequest(defaultParameters);
    }
  }, [defaultParameters, isManual, isReady, runRequest]);
}

function useRefreshDepsEffect<TParameters extends unknown[]>(
  refreshDeps: unknown[],
  isReady: boolean,
  latestParameters: MutableRefObject<TParameters | undefined>,
  runRequest: (parameters: TParameters, isRefresh?: boolean) => void
): void {
  useEffect(() => {
    const parameters = latestParameters.current;
    if (refreshDeps.length > 0 && parameters && isReady) {
      runRequest(parameters, true);
    }
  }, [isReady, latestParameters, refreshDeps, runRequest]);
}

function useWindowFocusRefreshEffect(
  shouldRefreshOnWindowFocus: boolean,
  focusThrottleWait: number,
  refresh: () => void,
  lastFocusTime: MutableRefObject<number>
): void {
  useEffect(() => {
    if (!shouldRefreshOnWindowFocus) {
      return;
    }

    const handleFocus = (): void => {
      const now = Date.now();
      if (now - lastFocusTime.current > focusThrottleWait) {
        lastFocusTime.current = now;
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [shouldRefreshOnWindowFocus, focusThrottleWait, refresh, lastFocusTime]);
}

function useReconnectRefreshEffect(shouldRefreshOnReconnect: boolean, refresh: () => void): void {
  useEffect(() => {
    if (!shouldRefreshOnReconnect) {
      return;
    }

    const handleOnline = (): void => {
      refresh();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [shouldRefreshOnReconnect, refresh]);
}

function usePollingEffect(
  pollingInterval: number | undefined,
  pollingWhenHidden: boolean,
  refresh: () => void,
  pollingTimer: MutableRefObject<ReturnType<typeof setInterval> | undefined>
): void {
  useEffect(() => {
    if (!pollingInterval) {
      return;
    }

    const poll = (): void => {
      if (document.hidden && !pollingWhenHidden) {
        return;
      }
      refresh();
    };

    const intervalId = setInterval(poll, pollingInterval);
    pollingTimer.current = intervalId;
    return () => clearInterval(intervalId);
  }, [pollingInterval, pollingWhenHidden, refresh, pollingTimer]);
}

function useRequestCleanup(
  cancel: () => void,
  pollingTimer: MutableRefObject<ReturnType<typeof setInterval> | undefined>
): void {
  useEffect(() => {
    const intervalId = pollingTimer.current;
    return () => {
      cancel();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [cancel, pollingTimer]);
}

/**
 * Hook for advanced data fetching with caching, retries, and more
 *
 * @template TData - The return type of the request
 * @template TParams - The parameter types for the request
 * @param service - Request service function
 * @param options - Request options
 * @returns Request result object
 *
 * @example
 * ```tsx
 * const { data, loading, error, run } = useRequest(
 *   (userId: string) => fetch(`/api/users/${userId}`).then(res => res.json()),
 *   {
 *     defaultParams: ['123'],
 *     retry: { count: 3 },
 *     refreshOnWindowFocus: true,
 *   }
 * );
 * ```
 */
// eslint-disable-next-line complexity, max-lines-per-function, max-statements -- Hook composes multiple optional behaviors into one API.
export function useRequest<TData = unknown, TParameters extends unknown[] = []>(
  service: (...args: TParameters) => Promise<TData>,
  requestOptions: UseRequestOptions<TData, TParameters> = {}
): UseRequestResult<TData, TParameters> {
  const {
    manual = false,
    defaultParams,
    refreshDeps = [],
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    refreshOnWindowFocus = false,
    focusThrottleWait = 5000,
    refreshOnReconnect = false,
    pollingInterval,
    pollingWhenHidden = false,
    loadingDelay = 0,
    retry = { count: 0 },
    debounceWait,
    throttleWait,
    ready = true,
    onBefore,
    onSuccess,
    onError,
    onFinally,
  } = requestOptions;

  const [data, setData] = useState<TData | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [parameters, setParameters] = useState<TParameters | undefined>(defaultParams);

  const latestParameters = useRef<TParameters | undefined>(defaultParams);
  const latestData = useRef<TData | undefined>();
  const debounceTimer = useRef<NodeJS.Timeout>();
  const throttleTimer = useRef<NodeJS.Timeout>();
  const lastThrottleTime = useRef<number>(0);
  const loadingDelayTimer = useRef<NodeJS.Timeout>();
  const lastFocusTime = useRef<number>(0);
  const pollingTimer = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();

  // Update refs
  latestParameters.current = parameters;
  latestData.current = data;

  /**
   * Execute the request with retry logic
   */
  const executeRequest = useCallback(
    async (requestParameters: TParameters, isRefresh = false): Promise<TData> => {
      const cacheKeyValue = getCacheKeyValue(cacheKey, requestParameters);

      // Create abort controller (best-effort cancellation)
      abortController.current = new AbortController();

      const _options: {
        cacheKeyValue?: string;
        cacheTime: number;
        isRefresh: boolean;
        retry: RetryConfig;
        onBefore?: (parameters: TParameters) => void;
        onSuccess?: (data: TData, parameters: TParameters) => void;
        onError?: (error: Error, parameters: TParameters) => void;
      } = {
        cacheTime,
        isRefresh,
        retry: retry as RetryConfig,
      };

      if (cacheKeyValue !== undefined) {
        _options.cacheKeyValue = cacheKeyValue;
      }
      if (onBefore) {
        _options.onBefore = onBefore;
      }
      if (onSuccess) {
        _options.onSuccess = onSuccess;
      }
      if (onError) {
        _options.onError = onError;
      }

      return executeWithRetry<TData, TParameters>(service, requestParameters, _options);
    },
    [service, cacheKey, cacheTime, retry, onBefore, onSuccess, onError]
  );

  /**
   * Run the request
   */
  const runRequestNow = useCallback(
    async (requestParameters: TParameters, isRefresh = false): Promise<void> => {
      let errorToReport: Error | undefined;
      try {
        setParameters(requestParameters);
        setError(undefined);

        // Loading delay
        if (loadingDelay > 0) {
          loadingDelayTimer.current = setTimeout(() => {
            setLoading(true);
          }, loadingDelay);
        } else {
          setLoading(true);
        }

        const result = await executeRequest(requestParameters, isRefresh);
        setData(result);
      } catch (error_) {
        const errorObject = error_ instanceof Error ? error_ : new Error(String(error_));
        errorToReport = errorObject;
        setError(errorObject);
        logHookError('useRequest', 'Request failed', errorObject, { params: requestParameters });
      } finally {
        clearTimeout(loadingDelayTimer.current);
        setLoading(false);
        onFinally?.(requestParameters, latestData.current, errorToReport);
      }
    },
    [loadingDelay, executeRequest, onFinally]
  );

  const runRequest = useCallback(
    (requestParameters: TParameters, isRefresh = false): void => {
      if (!ready) {
        return;
      }

      if (!isRefresh && debounceWait) {
        scheduleDebounced(debounceTimer, debounceWait, () => {
          void runRequestNow(requestParameters, isRefresh);
        });
        return;
      }

      if (
        !isRefresh &&
        throttleWait &&
        scheduleThrottled(throttleTimer, lastThrottleTime, throttleWait, () => {
          void runRequestNow(requestParameters, isRefresh);
        })
      ) {
        return;
      }

      void runRequestNow(requestParameters, isRefresh);
    },
    [ready, debounceWait, throttleWait, runRequestNow]
  );

  /**
   * Manual run function
   */
  const run = useCallback(
    (...args: TParameters): void => {
      void runRequest(args);
    },
    [runRequest]
  );

  /**
   * Async run function
   */
  const runAsync = useCallback(
    (...args: TParameters): Promise<TData> => {
      return executeRequest(args);
    },
    [executeRequest]
  );

  /**
   * Refresh function
   */
  const refresh = useCallback((): void => {
    if (latestParameters.current) {
      void runRequest(latestParameters.current, true);
    }
  }, [runRequest]);

  /**
   * Async refresh function
   */
  const refreshAsync = useCallback((): Promise<TData> => {
    if (!latestParameters.current) {
      throw new Error('No previous parameters to refresh with');
    }
    return executeRequest(latestParameters.current, true);
  }, [executeRequest]);

  /**
   * Cancel function
   */
  const cancel = useCallback((): void => {
    abortController.current?.abort();
    clearTimeout(loadingDelayTimer.current);
    clearTimeout(debounceTimer.current);
    clearTimeout(throttleTimer.current);
    setLoading(false);
  }, []);

  /**
   * Mutate function
   */
  const mutate = useCallback((newData: TData | ((oldData: TData | undefined) => TData)): void => {
    const dataToSet =
      typeof newData === 'function'
        ? (newData as (oldData: TData | undefined) => TData)(latestData.current)
        : newData;
    setData(dataToSet);
    latestData.current = dataToSet;
  }, []);

  useInitialExecution(manual, defaultParams, ready, runRequest);
  useRefreshDepsEffect(refreshDeps, ready, latestParameters, runRequest);
  useWindowFocusRefreshEffect(refreshOnWindowFocus, focusThrottleWait, refresh, lastFocusTime);
  useReconnectRefreshEffect(refreshOnReconnect, refresh);
  usePollingEffect(pollingInterval, pollingWhenHidden, refresh, pollingTimer);
  useRequestCleanup(cancel, pollingTimer);

  return {
    data,
    loading,
    error,
    params: parameters,
    run,
    runAsync,
    refresh,
    refreshAsync,
    cancel,
    mutate,
  };
}
