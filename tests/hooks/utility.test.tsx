import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTitle, useScript, useLockBodyScroll } from '../../src/hooks/utility/index.js';

describe('Utility Hooks', () => {
  describe('useTitle', () => {
    const originalTitle = document.title;

    afterEach(() => {
      document.title = originalTitle;
    });

    it('should set document title', () => {
      renderHook(() => useTitle('New Title'));
      expect(document.title).toBe('New Title');
    });

    it('should update document title when value changes', () => {
      const { rerender } = renderHook(({ title }) => useTitle(title), {
        initialProps: { title: 'First Title' },
      });

      expect(document.title).toBe('First Title');

      rerender({ title: 'Second Title' });
      expect(document.title).toBe('Second Title');
    });

    it('should restore previous title on unmount', () => {
      document.title = 'Original Title';
      const { unmount } = renderHook(() => useTitle('New Title'));

      expect(document.title).toBe('New Title');

      unmount();
      expect(document.title).toBe('Original Title');
    });
  });

  describe('useScript', () => {
    it('should start with loading state', () => {
      const { result, unmount } = renderHook(() =>
        useScript('https://example.com/test-script-1.js')
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.ready).toBe(false);

      unmount();
    });

    it('should add script to document body', () => {
      const { unmount } = renderHook(() => useScript('https://example.com/test-script-2.js'));

      const script = document.querySelector('script[src="https://example.com/test-script-2.js"]');
      expect(script).not.toBe(null);

      unmount();
    });

    it('should set async attribute by default', () => {
      const { unmount } = renderHook(() => useScript('https://example.com/test-script-3.js'));

      const script = document.querySelector(
        'script[src="https://example.com/test-script-3.js"]'
      ) as HTMLScriptElement;
      expect(script?.async).toBe(true);

      unmount();
    });

    it('should respect async option', () => {
      const { unmount } = renderHook(() =>
        useScript('https://example.com/test-script-4.js', { async: false })
      );

      const script = document.querySelector(
        'script[src="https://example.com/test-script-4.js"]'
      ) as HTMLScriptElement;
      expect(script?.async).toBe(false);

      unmount();
    });

    it('should set defer attribute when specified', () => {
      const { unmount } = renderHook(() =>
        useScript('https://example.com/test-script-5.js', { defer: true })
      );

      const script = document.querySelector(
        'script[src="https://example.com/test-script-5.js"]'
      ) as HTMLScriptElement;
      expect(script?.defer).toBe(true);

      unmount();
    });

    it('should not load script when src is empty', () => {
      const { unmount } = renderHook(() => useScript(''));

      const scripts = document.querySelectorAll('script[src=""]');
      expect(scripts.length).toBe(0);

      unmount();
    });
  });

  describe('useLockBodyScroll', () => {
    const originalOverflow = document.body.style.overflow;

    beforeEach(() => {
      document.body.style.overflow = '';
    });

    afterEach(() => {
      document.body.style.overflow = originalOverflow;
    });

    it('should lock body scroll by default', () => {
      renderHook(() => useLockBodyScroll());
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should lock body scroll when lock is true', () => {
      renderHook(() => useLockBodyScroll(true));
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should not lock body scroll when lock is false', () => {
      document.body.style.overflow = 'visible';
      renderHook(() => useLockBodyScroll(false));
      expect(document.body.style.overflow).toBe('visible');
    });

    it('should restore original overflow on unmount', () => {
      document.body.style.overflow = 'auto';
      const { unmount } = renderHook(() => useLockBodyScroll());

      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('auto');
    });
  });
});
