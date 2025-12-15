/**
 * Custom hooks export
 *
 * For backward compatibility, commonly used hooks are re-exported here.
 * New code should import from domain-specific subdirectories for better tree-shaking.
 */

// Root-level hooks (intentionally at root)
export * from './usePrevious.js';
export * from './useToggle.js';

// State management hooks
export * from './state/index.js';

// Lifecycle hooks
export * from './lifecycle/index.js';

// Browser API hooks (includes useLocalStorage from browser/)
export * from './browser/index.js';

// Event hooks
export * from './events/index.js';

// Async hooks
export * from './async/index.js';

// Performance hooks
export * from './performance/index.js';

// Form hooks
export * from './form/index.js';

// Utility hooks
export * from './utility/index.js';

// UI hooks
export * from './ui/index.js';
