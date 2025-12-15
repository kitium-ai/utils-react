# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v3.0.0] - 2025-12-15

### BREAKING CHANGES

- **Import Path Changes**: Storage and performance hooks moved to organized subdirectories
  - `useLocalStorage` and `useSessionStorage` moved to `hooks/browser/` (re-exported at root)
  - `useDebounce` and `useDebounceCallback` moved to `hooks/performance/` (re-exported at root)
  - See [MIGRATION.md](./MIGRATION.md) for detailed upgrade guide

- **flushSync Removal**: Removed `flushSync` from `useThrottle`, `useAsync`, and `useUpdate`
  - Improves React Native compatibility
  - Allows natural React state batching
  - May affect timing in edge cases (transparent improvement)

### Added

- **Storage Factory**: New `createStorageHook` factory eliminates 90% duplication between storage hooks
- **Delayed Callback Factory**: New `createDelayedCallback` factory unifies debounce/throttle infrastructure
- **Error Logging Utility**: Structured error logging via `logHookWarning` and `logHookError`
- **SSR Consolidation**: Centralized `isBrowser()` utility for consistent SSR checks
- **MIGRATION.md**: Comprehensive migration guide for v3.0.0 upgrade

### Changed

- **Code Quality Improvements**:
  - Reduced total codebase by ~300 lines (11% reduction)
  - Storage hooks: 68% code reduction through factory pattern
  - Delayed callbacks: 54-57% code reduction through factory pattern
  - Consolidated 7 `console.warn` calls to structured logging utility

- **Infrastructure**:
  - Replaced 8 instances of `typeof window === 'undefined'` with `isBrowser()`
  - Updated file organization for better tree-shaking
  - Enhanced JSDoc documentation for all moved hooks

### Fixed

- React Native compatibility (removed `flushSync` dependency)
- Consistent error handling across all hooks
- SSR safety through unified checks

## [v2.0.1] - 2025-11-30

### Added

bumped patch versions from kitiumai packages

## [v2.0.0] - 2025-11-28

### Added

- Documented the full hook catalog with examples, signatures, and import guidance in `README.md`.

### Changed

- Hardened `usePerformanceLogger` to fall back to `Date.now()` when `performance.now` is unavailable (SSR or restricted environments).

## [1.0.0] - 2024-12-19

### Added

#### Testing Infrastructure

- Added Vitest configuration with React Testing Library support
- Created test setup file with jest-dom matchers
- Added test coverage configuration with thresholds (90% lines, functions, statements; 85% branches)
- Added comprehensive test suite for all hook categories

#### State Management Hooks

- `useBoolean` - Manage boolean state with setTrue, setFalse, and toggle helpers
- `useCounter` - Counter hook with increment, decrement, reset, and min/max/step options
- `useSetState` - Object state management with partial updates (similar to class component setState)
- `useList` - Array state management with push, removeAt, insertAt, updateAt, clear, and reset helpers
- `useLatest` - Always returns the latest value (useful for callbacks without re-renders)
- `useDefault` - Returns value or default if value is null/undefined

#### Lifecycle Hooks

- `useMount` - Execute function on component mount
- `useUnmount` - Execute function on component unmount
- `useUpdateEffect` - useEffect that skips the first render
- `useUpdateLayoutEffect` - useLayoutEffect that skips the first render
- `useFirstMountState` - Returns true only on the first render
- `useMountedState` - Returns function to check if component is mounted
- `useUpdate` - Force component re-render
- `useIsomorphicLayoutEffect` - SSR-safe version of useLayoutEffect

#### Browser API Hooks

- `useSessionStorage` - Sync state with sessionStorage (with cross-tab support)
- `useMediaQuery` - Track media query matches
- `useWindowSize` - Track window dimensions
- `useWindowScroll` - Track window scroll position
- `useClipboard` - Copy to clipboard with fallback support
- `useOnline` - Track online/offline status
- `useVisibility` - Track page visibility (document.hidden)
- `useElementSize` - Track element dimensions using ResizeObserver
- `useIntersectionObserver` - Track element intersection with viewport

#### Event Hooks

- `useClickOutside` - Detect clicks outside an element
- `useHover` - Track hover state of an element
- `useKeyboard` - Handle keyboard events with configurable target and event type
- `useKeyPress` - Detect when a specific key is pressed
- `useMouse` - Track mouse position

#### Async Hooks

- `useAsync` - Execute async function and track loading/error/value state
- `useInterval` - Run callback at specified interval (can be paused with null delay)
- `useTimeout` - Run callback after specified delay (can be cancelled with null delay)

#### Performance Hooks

- `useThrottle` - Throttle value changes
- `useThrottleCallback` - Throttle callback function calls

#### Form Hooks

- `useInput` - Manage input state with onChange handler and reset
- `useCheckbox` - Manage checkbox state with onChange handler and toggle

#### Utility Hooks

- `useTitle` - Set document title (restores on unmount)
- `useScript` - Dynamically load scripts with loading/error/ready state
- `useLockBodyScroll` - Lock body scroll (useful for modals)

#### UI Hooks

- `useModal` - Manage modal open/close state with open, close, and toggle helpers

### Changed

- Organized hooks into logical categories (state, lifecycle, browser, events, async, performance, form, utility, ui)
- Updated main hooks index to export all new hooks
- Enhanced existing hooks with comprehensive JSDoc documentation
- Fixed typo in `useDebounceCallback` JSDoc example

### Documentation

- Added comprehensive JSDoc documentation to all hooks with:
  - Detailed descriptions
  - Type parameters
  - Parameter documentation
  - Return value documentation
  - Usage examples
- All hooks now include TypeScript type definitions
- Created comprehensive test suite with examples

### Testing

- Added test files for all hook categories:
  - State hooks tests (`tests/hooks/state.test.tsx`)
  - Lifecycle hooks tests (`tests/hooks/lifecycle.test.tsx`)
  - Browser hooks tests (`tests/hooks/browser.test.tsx`)
  - Async hooks tests (`tests/hooks/async.test.tsx`)
  - Performance hooks tests (`tests/hooks/performance.test.tsx`)
  - Form hooks tests (`tests/hooks/form.test.tsx`)

### Infrastructure

- Added Vitest configuration (`vitest.config.ts`)
- Added test setup file (`tests/setup.ts`)
- Updated package.json with test scripts:
  - `test` - Run tests once
  - `test:watch` - Run tests in watch mode
  - `test:ui` - Run tests with UI
  - `test:coverage` - Run tests with coverage report
- Added dev dependencies:
  - `@vitejs/plugin-react` - React plugin for Vite/Vitest
  - `@testing-library/jest-dom` - Jest DOM matchers
  - `@testing-library/user-event` - User event simulation
  - `jsdom` - DOM environment for testing

### Statistics

- **Total Hooks**: 50+ hooks
- **New Hooks Added**: 45+ hooks
- **Test Coverage**: Comprehensive test suite with 90%+ coverage targets
- **Documentation**: 100% JSDoc coverage

---

## Previous Versions

This is the initial major release (1.0.0) of the comprehensive React hooks library. Previous versions were pre-release or development versions.
