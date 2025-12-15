import { useCallback, useEffect, useRef, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';
import { isBrowser } from '../../utils/ssr.js';

/**
 * Speech synthesis state
 */
export type SpeechState = {
  speaking: boolean;
  paused: boolean;
  pending: boolean;
  error: string | null;
  supported: boolean;
};

/**
 * Speech synthesis controls
 */
export type SpeechControls = {
  speak: (text: string, options?: SpeechSynthesisUtterance) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  cancel: () => void;
  getVoices: () => SpeechSynthesisVoice[];
};

/**
 * Hook that synthesizes speech from a text string
 *
 * @returns Speech state and controls
 *
 * @example
 * ```tsx
 * const { speaking, speak, stop } = useSpeech();
 *
 * return (
 *   <div>
 *     <button onClick={() => speak('Hello, world!')} disabled={speaking}>
 *       Speak
 *     </button>
 *     <button onClick={stop} disabled={!speaking}>
 *       Stop
 *     </button>
 *   </div>
 * );
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- SpeechSynthesis needs state + event handlers + controls.
export function useSpeech(): SpeechState & SpeechControls {
  const [state, setState] = useState<SpeechState>({
    speaking: false,
    paused: false,
    pending: false,
    error: null,
    supported: false,
  });

  const utteranceReference = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    setState((previous) => ({
      ...previous,
      supported: 'speechSynthesis' in window,
    }));

    // Set up event listeners on window.speechSynthesis
    const synth = window.speechSynthesis;

    // We can't directly attach listeners to speechSynthesis, so we handle them in the speak function
    // But we can check if it's supported

    return () => {
      if (utteranceReference.current) {
        synth.cancel();
      }
    };
  }, []);

  // eslint-disable-next-line max-lines-per-function -- Encapsulates full utterance lifecycle.
  const speak = useCallback((text: string, options?: Partial<SpeechSynthesisUtterance>): void => {
    if (!isBrowser() || !window.speechSynthesis) {
      setState((previous) => ({
        ...previous,
        error: 'Speech synthesis not supported',
      }));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply options
    Object.assign(utterance, options);

    utterance.onstart = () => {
      setState((previous) => ({
        ...previous,
        speaking: true,
        paused: false,
        pending: false,
        error: null,
      }));
    };

    utterance.onend = () => {
      setState((previous) => ({
        ...previous,
        speaking: false,
        paused: false,
        pending: false,
      }));
    };

    utterance.onpause = () => {
      setState((previous) => ({
        ...previous,
        paused: true,
      }));
    };

    utterance.onresume = () => {
      setState((previous) => ({
        ...previous,
        paused: false,
      }));
    };

    utterance.onerror = (event) => {
      setState((previous) => ({
        ...previous,
        speaking: false,
        paused: false,
        pending: false,
        error: event.error,
      }));
      logHookError('useSpeech', 'Speech synthesis error', new Error(event.error));
    };

    utteranceReference.current = utterance;
    setState((previous) => ({ ...previous, pending: true }));

    window.speechSynthesis.speak(utterance);
  }, []);

  const pause = useCallback((): void => {
    if (!isBrowser() || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback((): void => {
    if (!isBrowser() || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.resume();
  }, []);

  const stop = useCallback((): void => {
    if (!isBrowser() || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    setState((previous) => ({
      ...previous,
      speaking: false,
      paused: false,
      pending: false,
    }));
  }, []);

  const cancel = useCallback((): void => {
    if (!isBrowser() || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    setState((previous) => ({
      ...previous,
      speaking: false,
      paused: false,
      pending: false,
    }));
  }, []);

  const getVoices = useCallback((): SpeechSynthesisVoice[] => {
    if (!isBrowser() || !window.speechSynthesis) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  }, []);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    cancel,
    getVoices,
  };
}
