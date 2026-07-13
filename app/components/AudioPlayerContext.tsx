"use client";

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ItunesTrack } from "@/lib/types";
import {
  addToPlaybackHistory,
  updatePlaybackProgress,
} from "@/lib/playback-history";
import { addToQueueHistory } from "@/lib/queue-history";

export type RepeatMode = "off" | "one" | "all";

interface AudioPlayerContextType {
  play: (url: string, id: number, metadata?: TrackMetadata) => void;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
  currentlyPlayingId: number | null;
  currentTime: number;
  duration: number;
  volume: number;
  progress: number;
  setVolume: (v: number) => void;
  seekTo: (time: number) => void;
  trackName: string | null;
  artistName: string | null;
  artworkUrl: string | null;
  currentTrack: ItunesTrack | null;
  queue: ItunesTrack[];
  addToQueue: (track: ItunesTrack) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  playNext: () => void;
  clearQueue: () => void;
  isExpanded: boolean;
  toggleExpanded: () => void;
  shuffleMode: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  cycleRepeatMode: () => void;
  previousTrack: () => void;
  sleepTimerRemaining: number | null;
  setSleepTimer: (minutes: number | null) => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  crossfadeEnabled: boolean;
  toggleCrossfade: () => void;
}

interface TrackMetadata {
  trackName?: string;
  artistName?: string;
  artworkUrl?: string;
  fullTrack?: ItunesTrack;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const volumeRef = useRef(1);
  const [progress, setProgress] = useState(0);
  const [trackName, setTrackName] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<ItunesTrack | null>(null);
  const [queue, setQueue] = useState<ItunesTrack[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false);

  // A counter that increments when a track ends, triggering the ended effect
  const [endedCounter, setEndedCounter] = useState(0);

  const historyStackRef = useRef<ItunesTrack[]>([]);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousVolumeRef = useRef(1);
  const crossfadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crossfadeEnabledRef = useRef(false);

  // Refs for values needed in the endedCounter effect to avoid stale closures
  const queueRef = useRef<ItunesTrack[]>([]);
  const shuffleModeRef = useRef(false);
  const repeatModeRef = useRef<RepeatMode>("off");
  const currentTrackRef = useRef<ItunesTrack | null>(null);

  // Keep refs in sync with state
  queueRef.current = queue;
  shuffleModeRef.current = shuffleMode;
  repeatModeRef.current = repeatMode;
  currentTrackRef.current = currentTrack;
  crossfadeEnabledRef.current = crossfadeEnabled;

  const resetPlaybackState = useCallback(() => {
    setCurrentTime(0);
    setDuration(0);
    setProgress(0);
  }, []);

  const clearPlayerState = useCallback(() => {
    setCurrentlyPlayingId(null);
    setIsPlaying(false);
    setTrackName(null);
    setArtistName(null);
    setArtworkUrl(null);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
    setProgress(0);
  }, []);

  /**
   * Properly release an Audio object to prevent memory leaks.
   * Sets src to empty and calls load() to release network resources.
   */
  const releaseAudio = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.src = "";
    audio.load();
  }, []);

  /**
   * Track audio elements that are currently fading out.
   * This prevents orphaned audio elements when rapid track switching
   * triggers multiple crossfades before earlier ones complete.
   */
  const fadingOutRef = useRef<Set<HTMLAudioElement>>(new Set());

  /**
   * Shared crossfade helper. Handles fading out old audio and fading in new audio.
   * If called while a previous fade is in progress, the old fading element is
   * immediately released, preventing orphaned Audio elements.
   */
  const performCrossfade = useCallback(
    (oldAudio: HTMLAudioElement, newAudio: HTMLAudioElement, targetVolume: number) => {
      // Cancel any existing crossfade interval
      if (crossfadeRef.current) {
        clearInterval(crossfadeRef.current);
        crossfadeRef.current = null;
      }

      // Release any previously fading-out elements to prevent orphaning
      for (const fadingAudio of fadingOutRef.current) {
        releaseAudio(fadingAudio);
      }
      fadingOutRef.current.clear();

      // Track the old audio element as fading out
      fadingOutRef.current.add(oldAudio);

      newAudio.volume = 0;
      const fadeSteps = 40; // 2 seconds at 50ms intervals
      const fadeInterval = 50;
      const volumeStep = targetVolume / fadeSteps;
      const oldStartVolume = oldAudio.volume || targetVolume;
      const oldVolumeStep = oldStartVolume / fadeSteps;
      let step = 0;

      crossfadeRef.current = setInterval(() => {
        step++;
        // Fade in new audio
        newAudio.volume = Math.min(targetVolume, volumeStep * step);
        // Fade out old audio
        oldAudio.volume = Math.max(0, oldStartVolume - oldVolumeStep * step);

        if (step >= fadeSteps) {
          if (crossfadeRef.current) {
            clearInterval(crossfadeRef.current);
            crossfadeRef.current = null;
          }
          // Remove from fading set and release
          fadingOutRef.current.delete(oldAudio);
          releaseAudio(oldAudio);
        }
      }, fadeInterval);
    },
    [releaseAudio]
  );

  /**
   * Transition from old audio to new audio, using crossfade if enabled,
   * or immediate switch otherwise.
   */
  const transitionAudio = useCallback(
    (oldAudio: HTMLAudioElement | null, newAudio: HTMLAudioElement, targetVolume: number) => {
      // Cancel any existing crossfade interval
      if (crossfadeRef.current) {
        clearInterval(crossfadeRef.current);
        crossfadeRef.current = null;
      }

      const shouldCrossfade = crossfadeEnabledRef.current && oldAudio && !oldAudio.paused;

      if (shouldCrossfade && oldAudio) {
        performCrossfade(oldAudio, newAudio, targetVolume);
      } else {
        newAudio.volume = targetVolume;
        if (oldAudio) {
          // Release any fading-out elements as well
          for (const fadingAudio of fadingOutRef.current) {
            releaseAudio(fadingAudio);
          }
          fadingOutRef.current.clear();
          releaseAudio(oldAudio);
        }
      }
    },
    [performCrossfade, releaseAudio]
  );

  // Clean up audio on unmount to prevent memory leaks
  useEffect(() => {
    const fadingOutSet = fadingOutRef.current;
    return () => {
      if (audioRef.current) {
        releaseAudio(audioRef.current);
        audioRef.current = null;
      }
      // Release any fading-out elements
      for (const fadingAudio of fadingOutSet) {
        releaseAudio(fadingAudio);
      }
      fadingOutSet.clear();
      if (crossfadeRef.current) {
        clearInterval(crossfadeRef.current);
        crossfadeRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [releaseAudio]);

  // Stable listener attachment (only time/metadata, no ended logic)
  const attachCoreListeners = useCallback((audio: HTMLAudioElement) => {
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setEndedCounter((c) => c + 1);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Internal function to start playing an ItunesTrack
  const startPlayingTrack = useCallback(
    (track: ItunesTrack) => {
      if (!track.previewUrl) return;
      const audio = new Audio(track.previewUrl);
      const targetVolume = isMuted ? 0 : volumeRef.current;
      audio.playbackRate = playbackRate;

      const oldAudio = audioRef.current;

      // Use shared transition helper for crossfade or immediate switch
      transitionAudio(oldAudio, audio, targetVolume);

      // Clean up old listeners
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      audioRef.current = audio;

      resetPlaybackState();
      setTrackName(track.trackName || null);
      setArtistName(track.artistName || null);
      setArtworkUrl(track.artworkUrl100 || null);
      setCurrentTrack(track);
      setCurrentlyPlayingId(track.trackId);
      setIsPlaying(true);

      // Attach listeners and store cleanup in ref
      const cleanup = attachCoreListeners(audio);
      cleanupRef.current = cleanup;

      audio.play().catch(() => {
        if (audioRef.current === audio) {
          cleanup();
          cleanupRef.current = null;
          audioRef.current = null;
          clearPlayerState();
        }
      });
    },
    [attachCoreListeners, resetPlaybackState, clearPlayerState, isMuted, playbackRate, transitionAudio]
  );

  // Handle ended event via effect - uses refs for current state to avoid stale closures
  useEffect(() => {
    if (endedCounter === 0) return;

    const currentRepeatMode = repeatModeRef.current;
    const currentQueue = queueRef.current;
    const currentShuffleMode = shuffleModeRef.current;
    const track = currentTrackRef.current;

    // Repeat one: loop current track
    if (currentRepeatMode === "one" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    // Play next from queue
    if (currentQueue.length > 0) {
      let nextIndex = 0;
      if (currentShuffleMode) {
        nextIndex = Math.floor(Math.random() * currentQueue.length);
      }
      const nextTrack = currentQueue[nextIndex];
      setQueue((prev) => prev.filter((_, i) => i !== nextIndex));
      startPlayingTrack(nextTrack);
      return;
    }

    // Repeat all: replay current track
    if (currentRepeatMode === "all" && track) {
      startPlayingTrack(track);
      return;
    }

    // No more tracks - stop
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    releaseAudio(audioRef.current);
    audioRef.current = null;
    clearPlayerState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endedCounter]);

  // Sleep timer countdown - pure state update only
  useEffect(() => {
    if (sleepTimerRemaining === null || sleepTimerRemaining <= 0) return;

    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [sleepTimerRemaining === null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sleep timer side effects - fires when timer reaches 0
  useEffect(() => {
    if (sleepTimerRemaining !== 0) return;

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerRemaining(null);
  }, [sleepTimerRemaining]);

  // Media Session API integration
  // Use refs for handlers to avoid dependency ordering issues
  const previousTrackRef = useRef<() => void>(() => {});
  const playNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (trackName) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackName || undefined,
        artist: artistName || undefined,
        album: currentTrack?.collectionName || undefined,
        artwork: artworkUrl
          ? [
              {
                src: artworkUrl.replace("100x100", "512x512"),
                sizes: "512x512",
                type: "image/jpeg",
              },
            ]
          : undefined,
      });
    }

    navigator.mediaSession.setActionHandler("play", () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      previousTrackRef.current();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      playNextRef.current();
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    };
  }, [trackName, artistName, artworkUrl, currentTrack]);

  // Persist last played track to localStorage
  useEffect(() => {
    if (currentTrack && currentlyPlayingId) {
      addToPlaybackHistory(currentTrack, 0);
    }
  }, [currentTrack, currentlyPlayingId]);

  // Periodically update progress in history
  useEffect(() => {
    if (!currentlyPlayingId || !isPlaying) return;
    const trackId = currentlyPlayingId;
    const interval = setInterval(() => {
      updatePlaybackProgress(trackId, audioRef.current?.currentTime || 0);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentlyPlayingId, isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, []);

  const play = useCallback(
    (url: string, id: number, metadata?: TrackMetadata) => {
      // Push current track to history stack using ref for fresh value
      const trackToPush = currentTrackRef.current;
      if (trackToPush) {
        historyStackRef.current = [
          trackToPush,
          ...historyStackRef.current.slice(0, 49),
        ];
      }

      const targetVolume = isMuted ? 0 : volumeRef.current;
      const oldAudio = audioRef.current;

      // Clean up old listeners
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      resetPlaybackState();

      setTrackName(metadata?.trackName || null);
      setArtistName(metadata?.artistName || null);
      setArtworkUrl(metadata?.artworkUrl || null);
      setCurrentTrack(metadata?.fullTrack || null);

      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      audioRef.current = audio;
      setCurrentlyPlayingId(id);
      setIsPlaying(true);

      // Track in queue history
      if (metadata?.fullTrack) {
        addToQueueHistory(metadata.fullTrack);
      }

      // Use shared transition helper for crossfade or immediate switch
      transitionAudio(oldAudio, audio, targetVolume);

      const cleanup = attachCoreListeners(audio);
      cleanupRef.current = cleanup;

      audio.play().catch(() => {
        if (audioRef.current === audio) {
          cleanup();
          cleanupRef.current = null;
          audioRef.current = null;
          clearPlayerState();
        }
      });
    },
    [attachCoreListeners, resetPlaybackState, clearPlayerState, isMuted, playbackRate, transitionAudio]
  );

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (clamped > 0) {
      previousVolumeRef.current = clamped;
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
        setProgress((time / audioRef.current.duration) * 100);
      }
    }
  }, []);

  const addToQueue = useCallback((track: ItunesTrack) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      return newQueue;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    if (currentTrack) {
      historyStackRef.current = [
        currentTrack,
        ...historyStackRef.current.slice(0, 49),
      ];
    }

    let nextIndex = 0;
    if (shuffleMode) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }

    const nextTrack = queue[nextIndex];
    setQueue((prev) => prev.filter((_, i) => i !== nextIndex));
    startPlayingTrack(nextTrack);
  }, [queue, shuffleMode, currentTrack, startPlayingTrack]);

  const previousTrack = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      return;
    }

    if (historyStackRef.current.length === 0) return;

    const prevTrack = historyStackRef.current[0];
    historyStackRef.current = historyStackRef.current.slice(1);
    startPlayingTrack(prevTrack);
  }, [startPlayingTrack]);

  // Keep media session handler refs in sync
  previousTrackRef.current = previousTrack;
  playNextRef.current = playNext;

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleMode((prev) => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "one";
      if (prev === "one") return "all";
      return "off";
    });
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (minutes === null) {
      setSleepTimerRemaining(null);
    } else {
      setSleepTimerRemaining(minutes * 60);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (audioRef.current) {
        if (newMuted) {
          previousVolumeRef.current = volumeRef.current;
          audioRef.current.volume = 0;
        } else {
          audioRef.current.volume = previousVolumeRef.current;
          setVolumeState(previousVolumeRef.current);
          volumeRef.current = previousVolumeRef.current;
        }
      }
      return newMuted;
    });
  }, []);

  const toggleCrossfade = useCallback(() => {
    setCrossfadeEnabled((prev) => !prev);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        play,
        pause,
        resume,
        isPlaying,
        currentlyPlayingId,
        currentTime,
        duration,
        volume,
        progress,
        setVolume,
        seekTo,
        trackName,
        artistName,
        artworkUrl,
        currentTrack,
        queue,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        playNext,
        clearQueue,
        isExpanded,
        toggleExpanded,
        shuffleMode,
        toggleShuffle,
        repeatMode,
        cycleRepeatMode,
        previousTrack,
        sleepTimerRemaining,
        setSleepTimer,
        playbackRate,
        setPlaybackRate,
        isMuted,
        toggleMute,
        crossfadeEnabled,
        toggleCrossfade,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}
