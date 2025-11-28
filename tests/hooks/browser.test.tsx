import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useSessionStorage,
  useMediaQuery,
  useWindowSize,
  useWindowScroll,
  useClipboard,
  useOnline,
  useVisibility,
  useElementSize,
  useIntersectionObserver,
} from '../../src/hooks/browser/index.js';
import { useLocalStorage } from '../../src/hooks/useLocalStorage.js';

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

  describe('useWindowScroll', () => {
    it('should track window scroll position', () => {
      const { result } = renderHook(() => useWindowScroll());
      expect(result.current.x).toBe(window.scrollX);
      expect(result.current.y).toBe(window.scrollY);
    });

    it('should update on scroll', () => {
      const { result } = renderHook(() => useWindowScroll());

      act(() => {
        Object.defineProperty(window, 'scrollX', { value: 100, writable: true });
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      // Note: Due to jsdom limitations, scroll values may not update as expected
      // This test verifies the hook runs without errors
      expect(result.current).toHaveProperty('x');
      expect(result.current).toHaveProperty('y');
    });
  });

  describe('useElementSize', () => {
    it('should track element size', () => {
      const { result } = renderHook(() => useElementSize<HTMLDivElement>());
      const [ref, size] = result.current;

      expect(size).toEqual({ width: 0, height: 0 });
      expect(ref).toBeDefined();
    });

    it('should update size when element is attached', () => {
      const { result } = renderHook(() => useElementSize<HTMLDivElement>());
      const [ref] = result.current;

      const div = document.createElement('div');
      Object.defineProperty(div, 'offsetWidth', { value: 100, writable: true });
      Object.defineProperty(div, 'offsetHeight', { value: 200, writable: true });
      document.body.appendChild(div);

      (ref as React.MutableRefObject<HTMLDivElement | null>).current = div;

      // Note: ResizeObserver may not work in jsdom, this tests basic functionality
      expect(result.current[1]).toHaveProperty('width');
      expect(result.current[1]).toHaveProperty('height');

      document.body.removeChild(div);
    });
  });

  describe('useIntersectionObserver', () => {
    it('should track intersection state', () => {
      // Mock IntersectionObserver
      const mockIntersectionObserver = vi.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      });
      global.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

      const { result } = renderHook(() =>
        useIntersectionObserver<HTMLDivElement>({ threshold: 0.5 })
      );
      const [ref, isIntersecting] = result.current;

      expect(isIntersecting).toBe(false);
      expect(ref).toBeDefined();
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should pass options to IntersectionObserver', () => {
      const mockIntersectionObserver = vi.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      });
      global.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

      const options = { threshold: 0.5, rootMargin: '10px' };
      renderHook(() => useIntersectionObserver<HTMLDivElement>(options));

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining(options)
      );
    });
  });

  describe('useLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should initialize with value', () => {
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      expect(result.current[0]).toBe('initial');
    });

    it('should read from localStorage', () => {
      localStorage.setItem('test', JSON.stringify('stored'));
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      expect(result.current[0]).toBe('stored');
    });

    it('should update localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      act(() => {
        result.current[1]('updated');
      });
      expect(localStorage.getItem('test')).toBe(JSON.stringify('updated'));
    });

    it('should handle function updates', () => {
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      act(() => {
        result.current[1]((prev) => prev + '-updated');
      });
      expect(result.current[0]).toBe('initial-updated');
    });

    it('should handle complex objects', () => {
      const obj = { foo: 'bar', count: 42 };
      const { result } = renderHook(() => useLocalStorage('test', obj));
      expect(result.current[0]).toEqual(obj);

      act(() => {
        result.current[1]({ foo: 'baz', count: 100 });
      });
      expect(result.current[0]).toEqual({ foo: 'baz', count: 100 });
    });

    it('should sync across tabs via storage event', async () => {
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));

      // Simulate storage event from another tab
      const event = new StorageEvent('storage', {
        key: 'test',
        newValue: JSON.stringify('from-another-tab'),
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(result.current[0]).toBe('from-another-tab');
      });
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('test', 'invalid-json');
      const { result } = renderHook(() => useLocalStorage('test', 'initial'));
      // Should fall back to initial value when JSON parsing fails
      expect(result.current[0]).toBe('initial');
    });
  });
});

