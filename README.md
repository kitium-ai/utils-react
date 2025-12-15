# @kitiumai/utils-react

**The Complete React Utilities Library for Modern Web Applications**

A comprehensive, production-ready collection of 60+ React hooks and utilities that combines the best patterns from industry-leading libraries (ahooks, react-use, SWR) with KitiumAI's focus on developer experience, type safety, and performance.

## 🚀 What is @kitiumai/utils-react?

`@kitiumai/utils-react` is a modern, tree-shakeable React utilities library designed for teams building complex web applications. It provides battle-tested hooks across all major React development domains: state management, async operations, browser APIs, UI interactions, performance optimization, and more.

Unlike fragmented utility libraries, this package offers a **unified API surface** with consistent patterns, comprehensive TypeScript support, and SSR-safe implementations.

## 🎯 Why You Need This Package

### Developer Productivity
- **60+ hooks** covering every aspect of React development
- **Consistent API patterns** across all domains
- **Comprehensive TypeScript support** with full type inference
- **Rich JSDoc documentation** with copy-paste examples
- **Tree-shakeable** - import only what you use

### Production Reliability
- **SSR-safe** implementations with proper browser guards
- **Error boundaries** and comprehensive error handling
- **Performance optimized** with debouncing, throttling, and caching
- **Memory leak prevention** with proper cleanup
- **Cross-browser compatibility** with graceful degradation

### Modern React Patterns
- **Concurrent mode ready** with proper async handling
- **Suspense compatible** hooks for data fetching
- **Custom hooks composition** for complex logic
- **Event-driven architecture** support
- **Real-time features** with WebSocket and polling support

## 🏆 Competitor Comparison

| Feature | @kitiumai/utils-react | ahooks | react-use | SWR |
|---------|----------------------|--------|-----------|-----|
| **Total Hooks** | 60+ | 60+ | 100+ | 15 |
| **SSR Safety** | ✅ Full | ⚠️ Partial | ⚠️ Partial | ✅ Full |
| **TypeScript** | ✅ First-class | ✅ Good | ⚠️ Limited | ✅ Excellent |
| **Tree Shaking** | ✅ ESM/CJS | ✅ ESM | ✅ ESM | ✅ ESM |
| **Error Handling** | ✅ Comprehensive | ✅ Good | ⚠️ Basic | ✅ Excellent |
| **Browser APIs** | ✅ 15+ hooks | ✅ 10+ hooks | ✅ 20+ hooks | ❌ None |
| **State Management** | ✅ 11 hooks | ✅ 8 hooks | ✅ 15 hooks | ❌ None |
| **Async/Data** | ✅ 6 hooks | ✅ 12 hooks | ✅ 10 hooks | ✅ 15 hooks |
| **UI/Media** | ✅ 6 hooks | ⚠️ Limited | ✅ 15 hooks | ❌ None |
| **Performance** | ✅ 4 hooks | ✅ 6 hooks | ✅ 8 hooks | ⚠️ Limited |
| **Forms** | ✅ 2 hooks | ⚠️ Limited | ✅ 5 hooks | ❌ None |
| **License** | MIT | MIT | MIT | MIT |
| **Bundle Size** | 🟢 Small | 🟡 Medium | 🟡 Large | 🟢 Small |

## ✨ Unique Selling Proposition (USP)

### 🎯 **Unified Ecosystem Integration**
- **@kitiumai/logger** integration for comprehensive hook error tracking
- **@kitiumai/types** compatibility for type-safe development
- **@kitiumai/config** alignment for consistent project setup
- **@kitiumai/lint** rules for code quality enforcement

### 🔧 **Enterprise-Grade Features**
- **Advanced async patterns** with retry, caching, and request deduplication
- **Real-time browser APIs** (Geolocation, Battery, Network State, Idle Detection)
- **Media controls** with full audio/video API coverage
- **Speech synthesis** and vibration APIs for rich user experiences
- **Error boundaries** with recovery mechanisms
- **Performance monitoring** with built-in metrics

### 🏗️ **Architectural Excellence**
- **Domain-driven organization** for predictable imports
- **Consistent naming conventions** across all hooks
- **Composable patterns** for complex application logic
- **Memory management** with automatic cleanup
- **Type-safe generics** throughout the API surface

## 📦 Installation

```bash
npm install @kitiumai/utils-react
# or
pnpm add @kitiumai/utils-react
# or
yarn add @kitiumai/utils-react
```

## 🗂️ Complete API Reference

### State Management Hooks (11)
- `useBoolean(initial?: boolean)` → `[value, { setTrue, setFalse, toggle }]`
- `useCounter(initial?: number, options?: { min?: number; max?: number; step?: number })` → `[count, { increment, decrement, reset, set }]`
- `useDefault<T>(value: T, defaultValue: T)` → default value when value is null/undefined
- `useLatest<T>(value: T)` → always returns the latest value (ref-based)
- `useList<T>(initial?: T[])` → `[list, { push, insertAt, updateAt, removeAt, clear, reset }]`
- `useMap<K, V>(initial?: Iterable<[K, V]>)` → `[map, { set, get, has, delete, clear, reset }]`
- `useQueue<T>(initial?: T[])` → `[queue, { enqueue, dequeue, peek, clear, size }]`
- `useSet<T>(initial?: Iterable<T>)` → `[set, { add, delete, has, clear, reset }]`
- `useSetState<T extends object>(initial: T)` → `[state, setState]` (object state management)
- `useStack<T>(initial?: T[])` → `[stack, { push, pop, peek, clear, size }]`
- `useStateWithHistory<T>(initial: T, options?: { capacity?: number; allowDuplicates?: boolean })` → `[state, setState, { history, pointer, undo, redo, clear }]`

### Lifecycle Hooks (8)
- `useFirstMountState()` → boolean indicating if component is mounting for the first time
- `useIsomorphicLayoutEffect(effect: EffectCallback, deps?: DependencyList)` → isomorphic layout effect
- `useMount(fn: () => void)` → run effect only on mount
- `useMountedState()` → boolean indicating if component is currently mounted
- `useUnmount(fn: () => void)` → run effect only on unmount
- `useUpdate(fn: () => void)` → run effect only on updates (not mount)
- `useUpdateEffect(effect: EffectCallback, deps?: DependencyList)` → effect only on updates
- `useUpdateLayoutEffect(effect: EffectCallback, deps?: DependencyList)` → layout effect only on updates

### Browser API Hooks (16)
- `useBattery()` → `{ supported, charging, chargingTime, dischargingTime, level }`
- `useClipboard()` → `[clipboard, { copy, paste, cut }]`
- `useElementSize<T extends HTMLElement>()` → `{ ref, width, height }`
- `useGeolocation(options?: PositionOptions)` → `{ position, loading, error, getCurrentPosition, watchId }`
- `useIdle(options?: { timeout?: number; initialState?: boolean })` → `{ idle, lastActive }`
- `useIntersectionObserver(options?: IntersectionObserverInit)` → `{ ref, entry, isIntersecting }`
- `useLocalStorage<T>(key: string, initialValue: T)` → `[value, setValue, remove]`
- `useMediaQuery(query: string)` → boolean matching media query
- `useNetworkState()` → `{ online, downlink, effectiveType, rtt, type }`
- `useOnline()` → boolean indicating online status
- `usePageLeave()` → callback when user attempts to leave page
- `usePermission(name: PermissionName)` → `{ state, request }`
- `useSessionStorage<T>(key: string, initialValue: T)` → `[value, setValue, remove]`
- `useVisibility()` → boolean indicating if page is visible
- `useWindowScroll()` → `{ x, y }` window scroll position
- `useWindowSize()` → `{ width, height }` window dimensions

### Event Hooks (5)
- `useClickOutside<T extends HTMLElement>(handler: () => void)` → `[ref]`
- `useHover<T extends HTMLElement>()` → `[ref, isHover]`
- `useKeyboard(handler: (event: KeyboardEvent) => void, options?: { event?: 'keydown' | 'keyup' | 'keypress' })` → cleanup function
- `useKeyPress(key: string, handler?: (event: KeyboardEvent) => void)` → boolean indicating if key is pressed
- `useMouse()` → `{ x, y, elementX, elementY, element }`

### Async Hooks (6)
- `useAsync<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>)` → `{ execute, value, error, loading }`
- `useAsyncFn<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>)` → `[state, execute]` where state is `{ value, error, loading }`
- `useAsyncRetry<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>, options?: { retryCount?: number; retryDelay?: number })` → `[state, execute, retry]`
- `useInterval(callback: () => void, delay?: number | null)` → `[start, stop, active]`
- `useRequest<TParams, TData>(service: (params: TParams) => Promise<TData>, options?: UseRequestOptions)` → comprehensive data fetching hook
- `useTimeout(callback: () => void, delay?: number | null)` → `[start, stop, active]`

### Performance Hooks (4)
- `useDebounce<T>(value: T, delay?: number)` → debounced value
- `useDebounceCallback<T extends (...args: unknown[]) => unknown>(callback: T, delay?: number, options?: { leading?: boolean; trailing?: boolean })` → debounced callback
- `useThrottle<T>(value: T, delay?: number)` → throttled value
- `useThrottleCallback<T extends (...args: unknown[]) => unknown>(callback: T, delay?: number)` → throttled callback

### Form Hooks (2)
- `useCheckbox(initial?: boolean)` → `[checked, { toggle, setChecked, bind }]`
- `useInput(initial?: string)` → `[value, { setValue, reset, bind }]`

### Utility Hooks (6)
- `useBeforeUnload(message?: string)` → prevent navigation with confirmation
- `useError()` → `[error, setError, clearError]` for error state management
- `useErrorBoundary(fallback: (props: { error: Error | null; reset: () => void }) => ReactNode)` → `[ErrorBoundary, resetError]`
- `useLockBodyScroll(lock?: boolean)` → lock/unlock body scroll
- `useScript(src: string, options?: { async?: boolean; defer?: boolean })` → script loading state
- `useTitle(title: string)` → set document title

### UI Hooks (6)
- `useAudio(src?: string)` → comprehensive audio controls and state
- `useFullscreen()` → `{ ref, fullscreen, enter, exit, toggle }`
- `useModal()` → `[visible, { open, close, toggle }]`
- `useSpeech()` → `{ speak, speaking, supported, pause, resume, stop }`
- `useVibrate(pattern?: number | number[])` → vibration control
- `useVideo(src?: string)` → comprehensive video controls and state

### Root-Level Hooks (2)
- `usePrevious<T>(value: T)` → previous value of a variable
- `useToggle(initial?: boolean)` → `[value, toggle]`

## 📚 Usage Examples

### Advanced State Management

```tsx
import { useMap, useQueue, useStateWithHistory } from '@kitiumai/utils-react';

function AdvancedStateDemo() {
  // Map state management
  const [userMap, { set: setUser, get: getUser, has: hasUser }] = useMap([
    ['alice', { name: 'Alice', role: 'admin' }],
    ['bob', { name: 'Bob', role: 'user' }]
  ]);

  // Queue for processing tasks
  const [taskQueue, { enqueue, dequeue, peek }] = useQueue<string>();

  // State with undo/redo
  const [count, setCount, { undo, redo, history }] = useStateWithHistory(0, {
    capacity: 10,
    allowDuplicates: false
  });

  return (
    <div>
      <h3>Users: {userMap.size}</h3>
      <button onClick={() => setUser('charlie', { name: 'Charlie', role: 'moderator' })}>
        Add User
      </button>

      <h3>Task Queue</h3>
      <button onClick={() => enqueue(`Task ${Date.now()}`)}>Add Task</button>
      <button onClick={() => dequeue()}>Process Task</button>
      <p>Next: {peek()}</p>

      <h3>Counter with History</h3>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={undo} disabled={!history.canUndo}>Undo</button>
      <button onClick={redo} disabled={!history.canRedo}>Redo</button>
    </div>
  );
}
```

### Advanced Data Fetching

```tsx
import { useRequest } from '@kitiumai/utils-react';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const {
    data: user,
    loading,
    error,
    refresh,
    cancel
  } = useRequest<User>(
    (id: number) => fetch(`/api/users/${id}`).then(r => r.json()),
    {
      defaultParams: userId,
      refreshOnWindowFocus: true,
      pollingInterval: 30000, // Poll every 30 seconds
      retry: { count: 3, delay: 1000 },
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => console.log('User loaded:', data),
      onError: (err) => console.error('Failed to load user:', err)
    }
  );

  if (loading) return <div>Loading user...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={refresh}>Refresh</button>
      <button onClick={cancel}>Cancel</button>
    </div>
  );
}
```

### Browser APIs & Real-time Features

```tsx
import { useGeolocation, useBattery, useNetworkState, useIdle } from '@kitiumai/utils-react';

function DeviceDashboard() {
  // Geolocation tracking
  const { position, loading: locationLoading, error: locationError, getCurrentPosition } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000
  });

  // Battery monitoring
  const { supported: batterySupported, level, charging } = useBattery();

  // Network state
  const { online, effectiveType, downlink } = useNetworkState();

  // Idle detection
  const { idle, lastActive } = useIdle({ timeout: 5 * 60 * 1000 }); // 5 minutes

  return (
    <div>
      <h2>Device Status</h2>

      <section>
        <h3>Location</h3>
        {locationLoading && <p>Getting location...</p>}
        {locationError && <p>Location error: {locationError.message}</p>}
        {position && (
          <p>
            📍 {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
          </p>
        )}
        <button onClick={getCurrentPosition}>Update Location</button>
      </section>

      <section>
        <h3>Battery</h3>
        {batterySupported ? (
          <p>
            🔋 {Math.round(level * 100)}% {charging ? '(Charging)' : ''}
          </p>
        ) : (
          <p>Battery monitoring not supported</p>
        )}
      </section>

      <section>
        <h3>Network</h3>
        <p>
          🌐 {online ? 'Online' : 'Offline'} - {effectiveType} ({downlink} Mbps)
        </p>
      </section>

      <section>
        <h3>Activity</h3>
        <p>
          {idle ? '😴 Idle' : '👀 Active'} - Last active: {new Date(lastActive).toLocaleTimeString()}
        </p>
      </section>
    </div>
  );
}
```

### Media Controls & UI

```tsx
import { useAudio, useVideo, useFullscreen, useSpeech } from '@kitiumai/utils-react';

function MediaPlayer({ audioSrc, videoSrc }: { audioSrc: string; videoSrc: string }) {
  // Audio controls
  const {
    playing: audioPlaying,
    volume: audioVolume,
    muted: audioMuted,
    currentTime: audioTime,
    duration: audioDuration,
    play: playAudio,
    pause: pauseAudio,
    setVolume: setAudioVolume,
    seek: seekAudio
  } = useAudio(audioSrc);

  // Video controls
  const {
    playing: videoPlaying,
    fullscreen,
    play: playVideo,
    pause: pauseVideo,
    enterFullscreen,
    exitFullscreen
  } = useVideo(videoSrc);

  // Speech synthesis
  const { speak, speaking, supported: speechSupported } = useSpeech();

  return (
    <div>
      <h2>Media Player</h2>

      <section>
        <h3>Audio Player</h3>
        <audio src={audioSrc} controls />
        <div>
          <button onClick={audioPlaying ? pauseAudio : playAudio}>
            {audioPlaying ? '⏸️' : '▶️'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={audioVolume}
            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
          />
          <span>{Math.round(audioTime)}s / {Math.round(audioDuration)}s</span>
        </div>
      </section>

      <section>
        <h3>Video Player</h3>
        <video src={videoSrc} style={{ width: '400px' }} />
        <div>
          <button onClick={videoPlaying ? pauseVideo : playVideo}>
            {videoPlaying ? '⏸️' : '▶️'}
          </button>
          <button onClick={fullscreen ? exitFullscreen : enterFullscreen}>
            {fullscreen ? '🗗️' : '🗖️'}
          </button>
        </div>
      </section>

      {speechSupported && (
        <section>
          <h3>Text-to-Speech</h3>
          <button
            onClick={() => speak('Hello! This is a text-to-speech demo.')}
            disabled={speaking}
          >
            {speaking ? 'Speaking...' : 'Speak Demo'}
          </button>
        </section>
      )}
    </div>
  );
}
```

### Error Handling & Recovery

```tsx
import { useErrorBoundary, useError } from '@kitiumai/utils-react';

function AppWithErrorBoundary() {
  const [ErrorBoundary, resetError] = useErrorBoundary(({ error, reset }) => (
    <div className="error-fallback">
      <h2>🚨 Something went wrong!</h2>
      <p>{error?.message}</p>
      <button onClick={reset}>Try Again</button>
      <button onClick={resetError}>Reset All Errors</button>
    </div>
  ));

  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

function ComponentWithErrorHandling() {
  const [error, setError, clearError] = useError();

  const handleRiskyOperation = async () => {
    try {
      await riskyApiCall();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return (
    <div>
      <button onClick={handleRiskyOperation}>Do Risky Thing</button>
      {error && (
        <div className="error-message">
          <p>Error: {error.message}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
```

## 🏗️ Architecture & Best Practices

### Import Patterns

```tsx
// Recommended: Import from specific domains for better tree-shaking
import { useRequest } from '@kitiumai/utils-react/hooks/async';
import { useLocalStorage } from '@kitiumai/utils-react/hooks/browser';
import { useMap, useQueue } from '@kitiumai/utils-react/hooks/state';

// Also supported: Import from root (larger bundle)
import { useRequest, useLocalStorage, useMap } from '@kitiumai/utils-react';
```

### Composition Patterns

```tsx
// Custom hook composition
function useUserProfile(userId: number) {
  const { data: user, loading, error, refresh } = useRequest(
    (id) => api.getUser(id),
    { defaultParams: userId, refreshOnWindowFocus: true }
  );

  const [preferences, setPreferences] = useLocalStorage(
    `user-prefs-${userId}`,
    { theme: 'light', notifications: true }
  );

  return { user, preferences, setPreferences, loading, error, refresh };
}

// Usage
function UserProfile({ userId }: { userId: number }) {
  const { user, preferences, setPreferences, loading } = useUserProfile(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <ThemeSelector
        theme={preferences.theme}
        onChange={(theme) => setPreferences(prev => ({ ...prev, theme }))}
      />
    </div>
  );
}
```

### Performance Optimization

```tsx
// Debounced search with request deduplication
function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, loading } = useRequest(
    (q: string) => searchAPI(q),
    {
      defaultParams: debouncedQuery,
      ready: debouncedQuery.length > 2, // Don't search for short queries
      cacheTime: 5 * 60 * 1000, // Cache results for 5 minutes
      retry: { count: 2, delay: 500 }
    }
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {loading && <div>Searching...</div>}
      {results && <SearchResults results={results} />}
    </div>
  );
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT © KitiumAI
