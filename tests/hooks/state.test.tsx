import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useBoolean,
  useCounter,
  useSetState,
  useList,
  useLatest,
  useDefault,
} from '../../src/hooks/state/index.js';

describe('state hooks', () => {
  describe('useBoolean', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useBoolean());
      expect(result.current[0]).toBe(false);
    });

    it('should initialize with custom value', () => {
      const { result } = renderHook(() => useBoolean(true));
      expect(result.current[0]).toBe(true);
    });

    it('should toggle value', () => {
      const { result } = renderHook(() => useBoolean());
      act(() => {
        result.current[1].toggle();
      });
      expect(result.current[0]).toBe(true);
    });

    it('should set true', () => {
      const { result } = renderHook(() => useBoolean(false));
      act(() => {
        result.current[1].setTrue();
      });
      expect(result.current[0]).toBe(true);
    });

    it('should set false', () => {
      const { result } = renderHook(() => useBoolean(true));
      act(() => {
        result.current[1].setFalse();
      });
      expect(result.current[0]).toBe(false);
    });
  });

  describe('useCounter', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useCounter());
      expect(result.current[0]).toBe(0);
    });

    it('should increment', () => {
      const { result } = renderHook(() => useCounter(0));
      act(() => {
        result.current[1].increment();
      });
      expect(result.current[0]).toBe(1);
    });

    it('should decrement', () => {
      const { result } = renderHook(() => useCounter(5));
      act(() => {
        result.current[1].decrement();
      });
      expect(result.current[0]).toBe(4);
    });

    it('should respect min/max', () => {
      const { result } = renderHook(() => useCounter(5, { min: 0, max: 10 }));
      act(() => {
        result.current[1].increment();
        result.current[1].increment();
      });
      expect(result.current[0]).toBe(7);

      act(() => {
        result.current[1].increment();
        result.current[1].increment();
        result.current[1].increment();
        result.current[1].increment();
      });
      expect(result.current[0]).toBe(10); // Max reached

      act(() => {
        result.current[1].decrement();
        result.current[1].decrement();
        result.current[1].decrement();
        result.current[1].decrement();
        result.current[1].decrement();
        result.current[1].decrement();
      });
      expect(result.current[0]).toBe(4); // Min not reached
    });

    it('should reset', () => {
      const { result } = renderHook(() => useCounter(10));
      act(() => {
        result.current[1].increment();
        result.current[1].increment();
      });
      expect(result.current[0]).toBe(12);

      act(() => {
        result.current[1].reset();
      });
      expect(result.current[0]).toBe(10);
    });
  });

  describe('useSetState', () => {
    it('should merge state updates', () => {
      const { result } = renderHook(() =>
        useSetState({ name: 'John', age: 30 })
      );
      act(() => {
        result.current[1]({ age: 31 });
      });
      expect(result.current[0]).toEqual({ name: 'John', age: 31 });
    });

    it('should support function updates', () => {
      const { result } = renderHook(() => useSetState({ count: 0 }));
      act(() => {
        result.current[1]((prev) => ({ count: prev.count + 1 }));
      });
      expect(result.current[0].count).toBe(1);
    });
  });

  describe('useList', () => {
    it('should initialize with empty array', () => {
      const { result } = renderHook(() => useList<number>());
      expect(result.current[0]).toEqual([]);
    });

    it('should push items', () => {
      const { result } = renderHook(() => useList<number>());
      act(() => {
        result.current[1].push(1);
        result.current[1].push(2);
      });
      expect(result.current[0]).toEqual([1, 2]);
    });

    it('should remove items at index', () => {
      const { result } = renderHook(() => useList([1, 2, 3]));
      act(() => {
        result.current[1].removeAt(1);
      });
      expect(result.current[0]).toEqual([1, 3]);
    });

    it('should insert items at index', () => {
      const { result } = renderHook(() => useList([1, 3]));
      act(() => {
        result.current[1].insertAt(1, 2);
      });
      expect(result.current[0]).toEqual([1, 2, 3]);
    });

    it('should update items at index', () => {
      const { result } = renderHook(() => useList([1, 2, 3]));
      act(() => {
        result.current[1].updateAt(1, 99);
      });
      expect(result.current[0]).toEqual([1, 99, 3]);
    });

    it('should clear list', () => {
      const { result } = renderHook(() => useList([1, 2, 3]));
      act(() => {
        result.current[1].clear();
      });
      expect(result.current[0]).toEqual([]);
    });

    it('should reset list', () => {
      const { result } = renderHook(() => useList([1, 2, 3]));
      act(() => {
        result.current[1].push(4);
        result.current[1].reset();
      });
      expect(result.current[0]).toEqual([1, 2, 3]);
    });
  });

  describe('useLatest', () => {
    it('should return latest value', () => {
      const { result, rerender } = renderHook(({ value }) => useLatest(value), {
        initialProps: { value: 1 },
      });

      expect(result.current.current).toBe(1);

      rerender({ value: 2 });
      expect(result.current.current).toBe(2);

      rerender({ value: 3 });
      expect(result.current.current).toBe(3);
    });
  });

  describe('useDefault', () => {
    it('should return value if not null/undefined', () => {
      const { result } = renderHook(
        ({ value }) => useDefault(value, 'default'),
        { initialProps: { value: 'value' } }
      );
      expect(result.current).toBe('value');
    });

    it('should return default if value is null', () => {
      const { result } = renderHook(
        ({ value }) => useDefault(value, 'default'),
        { initialProps: { value: null } }
      );
      expect(result.current).toBe('default');
    });

    it('should return default if value is undefined', () => {
      const { result } = renderHook(
        ({ value }) => useDefault(value, 'default'),
        { initialProps: { value: undefined } }
      );
      expect(result.current).toBe('default');
    });
  });
});

