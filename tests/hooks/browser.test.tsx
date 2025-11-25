import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useSessionStorage,
  useMediaQuery,
  useWindowSize,
  useWindowScroll,
  useClipboard,
  useOnline,
  useVisibility,
} from '../../src/hooks/browser/index.js';

describe('browser hooks', () => {
  beforeEach(() => {
    // Clear storage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('useSessionStorage', () => {
    it('should initialize with value', () => {
      const { result } = renderHook(() =>
        useSessionStorage('test', 'initial')
      );
      expect(result.current[0]).toBe('initial');
    });

    it('should read from sessionStorage', () => {
      sessionStorage.setItem('test', JSON.stringify('stored'));
      const { result } = renderHook(() => useSessionStorage('test', 'initial'));
      expect(result.current[0]).toBe('stored');
    });

    it('should update sessionStorage', () => {
      const { result } = renderHook(() =>
        useSessionStorage('test', 'initial')
      );
      result.current[1]('updated');
      expect(sessionStorage.getItem('test')).toBe(JSON.stringify('updated'));
    });
  });

  describe('useMediaQuery', () => {
    it('should return false for non-matching query', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
      expect(result.current).toBe(false);
    });
  });

  describe('useWindowSize', () => {
    it('should return window size', () => {
      const { result } = renderHook(() => useWindowSize());
      expect(result.current.width).toBeGreaterThan(0);
      expect(result.current.height).toBeGreaterThan(0);
    });
  });

  describe('useClipboard', () => {
    it('should copy to clipboard', async () => {
      const writeTextSpy = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextSpy,
        },
      });

      const { result } = renderHook(() => useClipboard());
      const success = await result.current[1].copy('test');
      expect(success).toBe(true);
      expect(writeTextSpy).toHaveBeenCalledWith('test');
    });
  });

  describe('useOnline', () => {
    it('should track online status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const { result } = renderHook(() => useOnline());
      expect(result.current).toBe(true);
    });
  });

  describe('useVisibility', () => {
    it('should track visibility', () => {
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useVisibility());
      expect(result.current).toBe(true);
    });
  });
});

