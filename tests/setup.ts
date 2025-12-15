import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(String(key)) ?? null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(String(key));
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
  };
}

function ensureStorage(name: 'localStorage' | 'sessionStorage'): void {
  const current = (globalThis as unknown as Record<string, unknown>)[name];
  const hasClear =
    typeof current === 'object' &&
    current !== null &&
    'clear' in current &&
    typeof (current as Storage).clear === 'function';

  if (hasClear) {
    return;
  }

  const storage = createMemoryStorage();
  vi.stubGlobal(name, storage);
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, { value: storage, configurable: true });
  }
}

ensureStorage('localStorage');
ensureStorage('sessionStorage');

// Cleanup after each test
afterEach(() => {
  cleanup();
});
