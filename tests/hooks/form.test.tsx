import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInput, useCheckbox } from '../../src/hooks/form/index.js';

describe('form hooks', () => {
  describe('useInput', () => {
    it('should initialize with value', () => {
      const { result } = renderHook(() => useInput('initial'));
      expect(result.current[0]).toBe('initial');
    });

    it('should update value', () => {
      const { result } = renderHook(() => useInput(''));
      act(() => {
        result.current[1]({
          target: { value: 'new value' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current[0]).toBe('new value');
    });

    it('should reset value', () => {
      const { result } = renderHook(() => useInput('initial'));
      act(() => {
        result.current[2].setValue('changed');
      });
      expect(result.current[0]).toBe('changed');

      act(() => {
        result.current[2].reset();
      });
      expect(result.current[0]).toBe('initial');
    });
  });

  describe('useCheckbox', () => {
    it('should initialize with checked state', () => {
      const { result } = renderHook(() => useCheckbox(true));
      expect(result.current[0]).toBe(true);
    });

    it('should toggle checked state', () => {
      const { result } = renderHook(() => useCheckbox(false));
      act(() => {
        result.current[1]({
          target: { checked: true },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current[0]).toBe(true);
    });

    it('should toggle programmatically', () => {
      const { result } = renderHook(() => useCheckbox(false));
      act(() => {
        result.current[2].toggle();
      });
      expect(result.current[0]).toBe(true);
    });
  });
});

