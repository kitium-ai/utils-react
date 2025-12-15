import { type RefObject, useCallback, useEffect, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';
import { isBrowser } from '../../utils/ssr.js';

/**
 * Fullscreen state
 */
export type FullscreenState = {
  isFullscreen: boolean;
  isSupported: boolean;
};

type DocumentWithVendorFullscreen = Document & {
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type ElementWithVendorFullscreen = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

/**
 * Hook to display an element or video full-screen
 *
 * @param ref - Ref to the element to make fullscreen
 * @returns Fullscreen state and control functions
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const { isFullscreen, enter, exit, toggle } = useFullscreen(ref);
 *
 * return (
 *   <div ref={ref}>
 *     <button onClick={toggle}>
 *       {isFullscreen ? 'Exit' : 'Enter'} Fullscreen
 *     </button>
 *   </div>
 * );
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- Fullscreen API needs vendor handling and event wiring.
export function useFullscreen(reference?: RefObject<Element>): FullscreenState & {
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
} {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const document_ = document as DocumentWithVendorFullscreen;
    const supported = [
      document_.fullscreenEnabled,
      document_.webkitFullscreenEnabled,
      document_.mozFullScreenEnabled,
      document_.msFullscreenEnabled,
    ].some(Boolean);
    setIsSupported(supported);

    const handleFullscreenChange = (): void => {
      const fullscreenElement =
        document_.fullscreenElement ??
        document_.webkitFullscreenElement ??
        document_.mozFullScreenElement ??
        document_.msFullscreenElement;
      setIsFullscreen(Boolean(fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const enter = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      logHookError(
        'useFullscreen',
        'Fullscreen API not supported',
        new Error('Fullscreen API not supported')
      );
      return;
    }

    const element = reference?.current ?? document.documentElement;
    const element_ = element as ElementWithVendorFullscreen;

    try {
      if (element_.requestFullscreen) {
        await element_.requestFullscreen();
      } else if (element_.webkitRequestFullscreen) {
        await element_.webkitRequestFullscreen();
      } else if (element_.mozRequestFullScreen) {
        await element_.mozRequestFullScreen();
      } else if (element_.msRequestFullscreen) {
        await element_.msRequestFullscreen();
      }
    } catch (error) {
      logHookError(
        'useFullscreen',
        'Failed to enter fullscreen',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [isSupported, reference]);

  const exit = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      return;
    }

    const document_ = document as DocumentWithVendorFullscreen;
    try {
      if (document_.exitFullscreen) {
        await document_.exitFullscreen();
      } else if (document_.webkitExitFullscreen) {
        await document_.webkitExitFullscreen();
      } else if (document_.mozCancelFullScreen) {
        await document_.mozCancelFullScreen();
      } else if (document_.msExitFullscreen) {
        await document_.msExitFullscreen();
      }
    } catch (error) {
      logHookError(
        'useFullscreen',
        'Failed to exit fullscreen',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [isSupported]);

  const toggle = useCallback(async (): Promise<void> => {
    if (isFullscreen) {
      await exit();
    } else {
      await enter();
    }
  }, [isFullscreen, enter, exit]);

  return {
    isFullscreen,
    isSupported,
    enter,
    exit,
    toggle,
  };
}
