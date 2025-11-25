import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useThrottle, useThrottleCallback } from '../../src/hooks/performance/index.js';

describe('performance hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useThrottle', () => {
    it('should throttle value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 500),
        { initialProps: { value: 1 } }
      );

      expect(result.current).toBe(1);

      rerender({ value: 2 });
      expect(result.current).toBe(1); // Not updated yet

      vi.advanceTimersByTime(500);
      await waitFor(() => {
        expect(result.current).toBe(2);
      });
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
  });
});

