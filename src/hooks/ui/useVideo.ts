import { useCallback, useEffect, useState } from 'react';

import { logHookError } from '../../utils/errorLogging.js';
import { isBrowser } from '../../utils/ssr.js';

type VideoElementWithVendorFullscreen = HTMLVideoElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

/**
 * Video state interface
 */
export type VideoState = {
  playing: boolean;
  paused: boolean;
  ended: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  muted: boolean;
  loading: boolean;
  error: string | null;
  buffered: TimeRanges | null;
  played: TimeRanges | null;
  seekable: TimeRanges | null;
};

/**
 * Video controls interface
 */
export type VideoControls = {
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  fullscreen: () => Promise<void>;
};

/**
 * Hook that plays video, tracks its state, and exposes playback controls
 *
 * @param src - Video source URL
 * @param options - Video options
 * @returns Video state and controls
 *
 * @example
 * ```tsx
 * const { playing, duration, currentTime, play, pause, seek } = useVideo('/video.mp4');
 *
 * return (
 *   <div>
 *     <video src={src} />
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
// eslint-disable-next-line max-lines-per-function -- Video element wiring and controls are necessarily verbose.
export function useVideo(
  source: string,
  options: {
    autoPlay?: boolean;
    loop?: boolean;
    volume?: number;
    muted?: boolean;
    controls?: boolean;
  } = {}
): VideoState & VideoControls {
  const { autoPlay = false, loop = false, volume = 1, muted = false, controls = true } = options;

  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [state, setState] = useState<VideoState>({
    playing: false,
    paused: true,
    ended: false,
    duration: 0,
    currentTime: 0,
    volume,
    muted,
    loading: true,
    error: null,
    buffered: null,
    played: null,
    seekable: null,
  });

  // Create video element
  // eslint-disable-next-line max-lines-per-function, max-statements -- Event wiring for many video events.
  useEffect(() => {
    if (!isBrowser() || !source) {
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.src = source;
    videoElement.autoplay = autoPlay;
    videoElement.loop = loop;
    videoElement.volume = volume;
    videoElement.muted = muted;
    videoElement.controls = controls;

    setVideo(videoElement);

    const handleLoadStart = (): void => {
      setState((previous) => ({ ...previous, loading: true, error: null }));
    };

    const handleLoadedData = (): void => {
      setState((previous) => ({
        ...previous,
        loading: false,
        duration: videoElement.duration,
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
        currentTime: videoElement.currentTime,
        buffered: videoElement.buffered,
        played: videoElement.played,
        seekable: videoElement.seekable,
      }));
    };

    const handleVolumeChange = (): void => {
      setState((previous) => ({
        ...previous,
        volume: videoElement.volume,
        muted: videoElement.muted,
      }));
    };

    const handleError = (): void => {
      const errorMessage = videoElement.error?.message ?? 'Video loading failed';
      setState((previous) => ({
        ...previous,
        loading: false,
        error: errorMessage,
      }));
      logHookError('useVideo', 'Video error', new Error(errorMessage), { src: source });
    };

    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      videoElement.removeEventListener('error', handleError);
      videoElement.pause();
    };
  }, [source, autoPlay, loop, volume, muted, controls]);

  const play = useCallback(async (): Promise<void> => {
    if (!video) {
      return;
    }
    try {
      await video.play();
    } catch (error) {
      logHookError(
        'useVideo',
        'Failed to play video',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [video]);

  const pause = useCallback((): void => {
    if (!video) {
      return;
    }
    video.pause();
  }, [video]);

  const toggle = useCallback(async (): Promise<void> => {
    if (state.playing) {
      pause();
    } else {
      await play();
    }
  }, [state.playing, play, pause]);

  const seek = useCallback(
    (time: number): void => {
      if (!video) {
        return;
      }
      video.currentTime = time;
    },
    [video]
  );

  const setVolume = useCallback(
    (newVolume: number): void => {
      if (!video) {
        return;
      }
      video.volume = Math.max(0, Math.min(1, newVolume));
    },
    [video]
  );

  const mute = useCallback((): void => {
    if (!video) {
      return;
    }
    video.muted = true;
  }, [video]);

  const unmute = useCallback((): void => {
    if (!video) {
      return;
    }
    video.muted = false;
  }, [video]);

  const toggleMute = useCallback((): void => {
    if (!video) {
      return;
    }
    video.muted = !video.muted;
  }, [video]);

  const fullscreen = useCallback(async (): Promise<void> => {
    if (!video) {
      return;
    }
    try {
      const video_ = video as VideoElementWithVendorFullscreen;

      if (video_.requestFullscreen) {
        await video_.requestFullscreen();
      } else if (video_.webkitRequestFullscreen) {
        await video_.webkitRequestFullscreen();
      } else if (video_.mozRequestFullScreen) {
        await video_.mozRequestFullScreen();
      } else if (video_.msRequestFullscreen) {
        await video_.msRequestFullscreen();
      }
    } catch (error) {
      logHookError(
        'useVideo',
        'Failed to enter fullscreen',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [video]);

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
    fullscreen,
  };
}
