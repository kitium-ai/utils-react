import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useMount,
  useUnmount,
  useUpdateEffect,
  useFirstMountState,
  useMountedState,
  useUpdate,
} from '../../src/hooks/lifecycle/index.js';

describe('lifecycle hooks', () => {
  describe('useMount', () => {
    it('should call function on mount', () => {
      const fn = vi.fn();
      renderHook(() => useMount(fn));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not call function on re-render', () => {
      const fn = vi.fn();
      const { rerender } = renderHook(() => useMount(fn));
      rerender();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('useUnmount', () => {
    it('should call function on unmount', () => {
      const fn = vi.fn();
      const { unmount } = renderHook(() => useUnmount(fn));
      unmount();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('useUpdateEffect', () => {
    it('should skip first render', () => {
      const fn = vi.fn();
      const { rerender } = renderHook(({ deps }) => useUpdateEffect(fn, deps), {
        initialProps: { deps: [1] },
      });
      expect(fn).not.toHaveBeenCalled();

      rerender({ deps: [2] });
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('useFirstMountState', () => {
    it('should return true on first render', () => {
      const { result } = renderHook(() => useFirstMountState());
      expect(result.current).toBe(true);
    });

    it('should return false on subsequent renders', () => {
      const { result, rerender } = renderHook(() => useFirstMountState());
      expect(result.current).toBe(true);
      rerender();
      expect(result.current).toBe(false);
    });
  });

  describe('useMountedState', () => {
    it('should return function that checks mounted state', () => {
      const { result, unmount } = renderHook(() => useMountedState());
      expect(result.current()).toBe(true);
      unmount();
      expect(result.current()).toBe(false);
    });
  });

  describe('useUpdate', () => {
    it('should force re-render', () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useUpdate();
      });

      const initialCount = renderCount;
      act(() => {
        result.current();
      });
      expect(renderCount).toBeGreaterThan(initialCount);
    });
  });
});
