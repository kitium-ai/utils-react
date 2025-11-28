# @kitiumai/utils-react

Comprehensive React utilities and custom hooks for KitiumAI projects, following patterns proven in production libraries (ahooks, usehooks-ts) while keeping APIs consistent across state, lifecycle, browser, async, performance, form, UI, and utility concerns.

## Installation

```bash
npm install @kitiumai/utils-react
# or
pnpm add @kitiumai/utils-react
```

## What you get

- **40+ hooks** grouped into familiar domains so imports stay predictable.
- **Tree-shakeable ESM/CJS exports**—import only what you use.
- **SSR-conscious browser hooks** that safely no-op when `window`/`performance` are unavailable.
- **Typed, documented APIs** with examples for quick copy/paste onboarding.

### Catalog at a glance

- **State**: `useToggle`, `useBoolean`, `useCounter`, `useList`, `useSetState`, `usePrevious`, `useLatest`, `useDefault`
- **Lifecycle**: `useMount`, `useUnmount`, `useUpdateEffect`, `useUpdateLayoutEffect`, `useFirstMountState`, `useMountedState`, `useUpdate`, `useIsomorphicLayoutEffect`
- **Async**: `useAsync`, `useInterval`, `useTimeout`
- **Performance**: `useDebounce`, `useDebounceCallback`, `useThrottle`, `useThrottleCallback`
- **Browser**: `useLocalStorage`, `useSessionStorage`, `useMediaQuery`, `useWindowSize`, `useWindowScroll`, `useClipboard`, `useOnline`, `useVisibility`, `useElementSize`, `useIntersectionObserver`
- **Events**: `useClickOutside`, `useHover`, `useKeyboard`, `useKeyPress`, `useMouse`
- **Forms**: `useInput`, `useCheckbox`
- **UI & Utilities**: `useModal`, `useLockBodyScroll`, `useTitle`, `useScript`

## Usage examples

### State helpers

```tsx
import { useBoolean, useCounter, useList } from '@kitiumai/utils-react';

function Dashboard() {
  const [enabled, { toggle }] = useBoolean(true);
  const [count, { increment, decrement, reset }] = useCounter(1, {
    min: 0,
    max: 5,
    step: 2,
  });
  const [items, { push, removeAt }] = useList(['alpha']);

  return (
    <div>
      <button onClick={toggle}>Enabled: {String(enabled)}</button>
      <button onClick={increment}>Increment ({count})</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => push('next')}>Add item ({items.length})</button>
      <button onClick={() => removeAt(0)}>Remove first</button>
    </div>
  );
}
```

### Async + performance

```tsx
import { useAsync, useDebounceCallback, useThrottleCallback } from '@kitiumai/utils-react';

function SearchBox({ fetchResults }: { fetchResults: (q: string) => Promise<string[]> }) {
  const debouncedSearch = useDebounceCallback(fetchResults, 250);
  const throttledLog = useThrottleCallback((value: string) => console.log('typed', value), 500);

  const { execute, loading, value } = useAsync(async (q: string) => {
    throttledLog(q);
    return debouncedSearch(q);
  });

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => {
          void execute(e.target.value);
        }}
      />
      {loading && <span>Loading…</span>}
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}
```

### Browser-safe storage

```tsx
import { useLocalStorage, useSessionStorage } from '@kitiumai/utils-react';

function ThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [lastVisit] = useSessionStorage('last-visit', () => new Date().toISOString());

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Theme: {theme}
      </button>
      <small>Last visit: {lastVisit}</small>
    </div>
  );
}
```

### Event boundaries

```tsx
import { useClickOutside, useHover } from '@kitiumai/utils-react';

function Tooltip({ onDismiss }: { onDismiss: () => void }) {
  const [hoverRef, hovering] = useHover<HTMLDivElement>();
  const overlayRef = useClickOutside<HTMLDivElement>(onDismiss);

  return (
    <div ref={overlayRef}>
      <div ref={hoverRef}>{hovering ? 'Hovering' : 'Hover me'}</div>
    </div>
  );
}
```

## API reference (quick signatures)

- `useBoolean(initial?: boolean)` → `[value, { setTrue, setFalse, toggle }]`
- `useCounter(initial?: number, options?: { min?: number; max?: number; step?: number })` → `[count, { increment, decrement, reset, set }]`
- `useList<T>(initial?: T[])` → `[list, { push, insertAt, updateAt, removeAt, clear, reset }]`
- `useAsync<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>)` → `{ execute, value, error, loading }`
- `useDebounce<T>(value: T, delay?: number)` / `useDebounceCallback(fn, delay?, options?)` → debounced value/callback with cancel + flush
- `useThrottle<T>(value: T, delay?: number)` / `useThrottleCallback(fn, delay?)` → throttled value/callback
- `useLocalStorage<T>(key: string, initial: T)` / `useSessionStorage<T>(key: string, initial: T | (() => T))` → `[value, setValue]` with cross-tab sync and SSR guards
- `useMount(fn)` / `useUnmount(fn)` / `useUpdateEffect(fn, deps)` / `useIsomorphicLayoutEffect` → lifecycle-safe utilities

## Tree-shaking and imports

```tsx
// Import only what you need from the root entrypoint
import { useBoolean, useAsync } from '@kitiumai/utils-react';

// Or deep import a category for bundlers that support it
import { useThrottle, useThrottleCallback } from '@kitiumai/utils-react/hooks/performance';
```

## TypeScript first

All hooks are written in TypeScript with explicit generics and return types to keep editor intellisense accurate.

## License

MIT © KitiumAI
