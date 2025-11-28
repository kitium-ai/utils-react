import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useThrottle, useThrottleCallback } from '../../src/hooks/performance/index.js';
import { useDebounce, useDebounceCallback } from '../../src/hooks/index.js';

describe('performance hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useThrottle', () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should throttle value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 500),
        { initialProps: { value: 1 } }
      );

      expect(result.current).toBe(1);

      rerender({ value: 2 });
      expect(result.current).toBe(1); // Not updated yet

      await waitFor(
        () => {
          expect(result.current).toBe(2);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('useThrottleCallback', () => {
    it('should throttle callback calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottleCallback(callback, 500));

      result.current();
      result.current();
      result.current();

      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should support options object', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useThrottleCallback(callback, { delay: 500, leading: true, trailing: true })
      );

      result.current();
      expect(callback).toHaveBeenCalledTimes(1); // Leading edge

      result.current();
      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(2); // Trailing edge
    });

    it('should support leading: false', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useThrottleCallback(callback, { delay: 500, leading: false, trailing: true })
      );

      result.current();
      expect(callback).toHaveBeenCalledTimes(0); // No leading edge

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1); // Trailing edge
    });

    it('should support cancel method', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottleCallback(callback, 500));

      result.current();
      expect(callback).toHaveBeenCalledTimes(1);

      result.current();
      result.current.cancel();

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1); // Cancelled, no trailing call
    });

    it('should support flush method', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottleCallback(callback, 500));

      result.current();
      expect(callback).toHaveBeenCalledTimes(1);

      result.current();
      result.current.flush();

      expect(callback).toHaveBeenCalledTimes(2); // Flushed immediately
    });

    it('should support isPending method', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottleCallback(callback, 500));

      expect(result.current.isPending()).toBe(false);

      result.current();
      expect(callback).toHaveBeenCalledTimes(1);

      result.current();
      expect(result.current.isPending()).toBe(true);

      vi.advanceTimersByTime(500);
      expect(result.current.isPending()).toBe(false);
    });
  });

  describe('useDebounce', () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
        initialProps: { value: 1 },
      });

      expect(result.current).toBe(1);

      rerender({ value: 2 });
      expect(result.current).toBe(1); // Not updated yet

      await waitFor(
        () => {
          expect(result.current).toBe(2);
        },
        { timeout: 1000 }
      );
    });

    it('should reset timer on rapid changes', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
        initialProps: { value: 1 },
      });

      rerender({ value: 2 });
      rerender({ value: 3 });
      rerender({ value: 4 });

      await waitFor(
        () => {
          expect(result.current).toBe(4);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('useDebounceCallback', () => {
    it('should debounce callback calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      result.current();
      result.current();
      result.current();

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support options object', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebounceCallback(callback, { delay: 500, leading: true })
      );

      result.current();
      expect(callback).toHaveBeenCalledTimes(1); // Leading edge

      result.current();
      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(2); // Trailing edge
    });

    it('should support leading edge invocation', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebounceCallback(callback, { delay: 500, leading: true })
      );

      result.current();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support maxWait option', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebounceCallback(callback, { delay: 1000, maxWait: 500 })
      );

      result.current();
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      result.current(); // Reset delay timer

      vi.advanceTimersByTime(200); // Total 500ms, maxWait reached
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support cancel method', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      result.current();
      result.current();
      result.current.cancel();

      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support flush method', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      result.current();
      expect(callback).not.toHaveBeenCalled();

      result.current.flush();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support isPending method', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      expect(result.current.isPending()).toBe(false);

      result.current();
      expect(result.current.isPending()).toBe(true);

      vi.advanceTimersByTime(500);
      expect(result.current.isPending()).toBe(false);
    });

    it('should maintain backwards compatibility with number delay', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      result.current();
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
