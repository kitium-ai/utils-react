import { renderHook, act, render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useClickOutside,
  useHover,
  useKeyboard,
  useKeyPress,
  useMouse,
} from '../../src/hooks/events/index.js';

describe('Event Hooks', () => {
  describe('useClickOutside', () => {
    it('should call handler when clicking outside element', () => {
      const handler = vi.fn();
      const { result } = renderHook(() => useClickOutside(handler));

      // Create and attach element
      const div = document.createElement('div');
      document.body.appendChild(div);
      (result.current as React.MutableRefObject<HTMLDivElement | null>).current = div;

      // Click outside
      const event = new MouseEvent('mousedown', { bubbles: true });
      document.body.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(div);
    });

    it('should not call handler when clicking inside element', () => {
      const handler = vi.fn();
      const { result } = renderHook(() => useClickOutside(handler));

      const div = document.createElement('div');
      document.body.appendChild(div);
      (result.current as React.MutableRefObject<HTMLDivElement | null>).current = div;

      // Click inside
      const event = new MouseEvent('mousedown', { bubbles: true });
      div.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(div);
    });

    it('should handle touch events', () => {
      const handler = vi.fn();
      const { result } = renderHook(() => useClickOutside(handler));

      const div = document.createElement('div');
      document.body.appendChild(div);
      (result.current as React.MutableRefObject<HTMLDivElement | null>).current = div;

      // Touch outside
      const event = new TouchEvent('touchstart', { bubbles: true });
      document.body.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(div);
    });
  });

  describe('useHover', () => {
    it('should track hover state', () => {
      const { result, rerender } = renderHook(() => useHover<HTMLDivElement>());

      const [ref, isHovered] = result.current;
      expect(isHovered).toBe(false);

      // Create and attach element
      const div = document.createElement('div');
      document.body.appendChild(div);
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = div;

      // Rerender to trigger effect
      rerender();

      // Trigger hover
      act(() => {
        fireEvent.mouseEnter(div);
      });

      expect(result.current[1]).toBe(true);

      // Trigger leave
      act(() => {
        fireEvent.mouseLeave(div);
      });

      expect(result.current[1]).toBe(false);

      document.body.removeChild(div);
    });

    it('should return false initially', () => {
      const { result } = renderHook(() => useHover());
      const [, isHovered] = result.current;

      expect(isHovered).toBe(false);
    });
  });

  describe('useKeyPress', () => {
    it('should call handler when target key is pressed', () => {
      const handler = vi.fn();
      renderHook(() => useKeyPress('Enter', handler));

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should not call handler when different key is pressed', () => {
      const handler = vi.fn();
      renderHook(() => useKeyPress('Enter', handler));

      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support keyup event', () => {
      const handler = vi.fn();
      renderHook(() => useKeyPress('Escape', handler, { event: 'keyup' }));

      const event = new KeyboardEvent('keyup', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle special keys', () => {
      const handler = vi.fn();
      renderHook(() => useKeyPress('Escape', handler));

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('useKeyboard', () => {
    it('should call handler on keyboard event', () => {
      const handler = vi.fn();
      renderHook(() => useKeyboard(handler));

      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should support different event types', () => {
      const handler = vi.fn();
      renderHook(() => useKeyboard(handler, { event: 'keyup' }));

      const event = new KeyboardEvent('keyup', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('useMouse', () => {
    it('should track mouse position', () => {
      const { result } = renderHook(() => useMouse());

      expect(result.current).toEqual({
        x: 0,
        y: 0,
      });

      act(() => {
        const event = new MouseEvent('mousemove', {
          clientX: 100,
          clientY: 200,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.x).toBe(100);
      expect(result.current.y).toBe(200);
    });

    it('should update position on window mousemove', () => {
      const { result } = renderHook(() => useMouse());

      act(() => {
        const event = new MouseEvent('mousemove', {
          clientX: 150,
          clientY: 250,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.x).toBe(150);
      expect(result.current.y).toBe(250);
    });
  });
});
