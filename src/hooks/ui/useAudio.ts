import { useCallback, useEffect, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';
import { isBrowser } from '../../utils/ssr.js';

/**
 * Audio state interface
 */
export type AudioState = {
  playing: boolean;
  paused: boolean;
  ended: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  muted: boolean;
  loading: boolean;
  error: string | null;
};

/**
 * Audio controls interface
 */
export type AudioControls = {
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
};

/**
 * Hook that plays audio and exposes its controls
 *
 * @param src - Audio source URL
 * @param options - Audio options
 * @returns Audio state and controls
 *
 * @example
 * ```tsx
 * const { playing, duration, currentTime, play, pause, seek } = useAudio('/audio.mp3');
 *
 * return (
 *   <div>
 *     <button onClick={playing ? pause : play}>
 *       {playing ? 'Pause' : 'Play'}
 *     </button>
 *     <input
 *       type="range"
 *       min="0"
 *       max={duration}
 *       value={currentTime}
 *       onChange={(e) => seek(Number(e.target.value))}
 *     />
 *   </div>
 * );
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- Audio element wiring and controls are necessarily verbose.
export function useAudio(
  source: string,
  options: {
    autoPlay?: boolean;
    loop?: boolean;
    volume?: number;
    muted?: boolean;
  } = {}
): AudioState & AudioControls {
  const { autoPlay = false, loop = false, volume = 1, muted = false } = options;

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    playing: false,
    paused: true,
    ended: false,
    duration: 0,
    currentTime: 0,
    volume,
    muted,
    loading: true,
    error: null,
  });

  // Create audio element
  // eslint-disable-next-line max-lines-per-function, max-statements -- Event wiring for many audio events.
  useEffect(() => {
    if (!isBrowser() || !source) {
      return;
    }

    const audioElement = new Audio(source);
    audioElement.autoplay = autoPlay;
    audioElement.loop = loop;
    audioElement.volume = volume;
    audioElement.muted = muted;

    setAudio(audioElement);

    const handleLoadStart = (): void => {
      setState((previous) => ({ ...previous, loading: true, error: null }));
    };

    const handleLoadedData = (): void => {
      setState((previous) => ({
        ...previous,
        loading: false,
        duration: audioElement.duration,
      }));
    };

    const handlePlay = (): void => {
      setState((previous) => ({
        ...previous,
        playing: true,
        paused: false,
        ended: false,
      }));
    };

    const handlePause = (): void => {
      setState((previous) => ({
        ...previous,
        playing: false,
        paused: true,
      }));
    };

    const handleEnded = (): void => {
      setState((previous) => ({
        ...previous,
        playing: false,
        paused: true,
        ended: true,
      }));
    };

    const handleTimeUpdate = (): void => {
      setState((previous) => ({
        ...previous,
        currentTime: audioElement.currentTime,
      }));
    };

    const handleVolumeChange = (): void => {
      setState((previous) => ({
        ...previous,
        volume: audioElement.volume,
        muted: audioElement.muted,
      }));
    };

    const handleError = (): void => {
      const errorMessage = audioElement.error?.message ?? 'Audio loading failed';
      setState((previous) => ({
        ...previous,
        loading: false,
        error: errorMessage,
      }));
      logHookError('useAudio', 'Audio error', new Error(errorMessage), { src: source });
    };

    audioElement.addEventListener('loadstart', handleLoadStart);
    audioElement.addEventListener('loadeddata', handleLoadedData);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('volumechange', handleVolumeChange);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('loadstart', handleLoadStart);
      audioElement.removeEventListener('loadeddata', handleLoadedData);
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('volumechange', handleVolumeChange);
      audioElement.removeEventListener('error', handleError);
      audioElement.pause();
    };
  }, [source, autoPlay, loop, volume, muted]);

  const play = useCallback(async (): Promise<void> => {
    if (!audio) {
      return;
    }
    try {
      await audio.play();
    } catch (error) {
      logHookError(
        'useAudio',
        'Failed to play audio',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [audio]);

  const pause = useCallback((): void => {
    if (!audio) {
      return;
    }
    audio.pause();
  }, [audio]);

  const toggle = useCallback(async (): Promise<void> => {
    if (state.playing) {
      pause();
    } else {
      await play();
    }
  }, [state.playing, play, pause]);

  const seek = useCallback(
    (time: number): void => {
      if (!audio) {
        return;
      }
      audio.currentTime = time;
    },
    [audio]
  );

  const setVolume = useCallback(
    (newVolume: number): void => {
      if (!audio) {
        return;
      }
      audio.volume = Math.max(0, Math.min(1, newVolume));
    },
    [audio]
  );

  const mute = useCallback((): void => {
    if (!audio) {
      return;
    }
    audio.muted = true;
  }, [audio]);

  const unmute = useCallback((): void => {
    if (!audio) {
      return;
    }
    audio.muted = false;
  }, [audio]);

  const toggleMute = useCallback((): void => {
    if (!audio) {
      return;
    }
    audio.muted = !audio.muted;
  }, [audio]);

  return {
    ...state,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    mute,
    unmute,
    toggleMute,
  };
}
