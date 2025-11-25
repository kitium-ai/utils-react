import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsync, useInterval, useTimeout } from '../../src/hooks/async/index.js';

describe('async hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useAsync', () => {
    it('should handle async function', async () => {
      const asyncFn = vi.fn().mockResolvedValue('result');
      const { result } = renderHook(() => useAsync(asyncFn));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.value).toBe('result');
      expect(result.current.error).toBeNull();
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      const asyncFn = vi.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useAsync(asyncFn));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.value).toBeNull();
    });
  });

  describe('useInterval', () => {
    it('should call callback at interval', () => {
      const callback = vi.fn();
      renderHook(() => useInterval(callback, 1000));

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should not run when delay is null', () => {
      const callback = vi.fn();
      renderHook(() => useInterval(callback, null));

      vi.advanceTimersByTime(10000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('useTimeout', () => {
    it('should call callback after delay', () => {
      const callback = vi.fn();
      renderHook(() => useTimeout(callback, 1000));

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should not run when delay is null', () => {
      const callback = vi.fn();
      renderHook(() => useTimeout(callback, null));

      vi.advanceTimersByTime(10000);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});

