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
import { usePathname } from "next/navigation";
import { ItunesTrack } from "@/lib/types";

interface AudioPlayerContextType {
  play: (url: string, id: number, metadata?: TrackMetadata) => void;
  pause: () => void;
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
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const volumeRef = useRef(1);
  const [progress, setProgress] = useState(0);
  const [trackName, setTrackName] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<ItunesTrack | null>(null);

  const resetPlaybackState = useCallback(() => {
    setCurrentTime(0);
    setDuration(0);
    setProgress(0);
  }, []);

  const stopAudio = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentlyPlayingId(null);
    setTrackName(null);
    setArtistName(null);
    setArtworkUrl(null);
    setCurrentTrack(null);
    resetPlaybackState();
  }, [resetPlaybackState]);

  // Keep a ref to stopAudio so the route-change effect can call it
  // without needing it in the dependency array (avoiding re-subscriptions)
  const stopAudioRef = useRef(stopAudio);
  useEffect(() => {
    stopAudioRef.current = stopAudio;
  }, [stopAudio]);

  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  // Stop audio on route change
  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      stopAudioRef.current();
    }
  }, [pathname]);

  const attachListeners = useCallback(
    (audio: HTMLAudioElement) => {
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
        if (audioRef.current === audio) {
          audioRef.current = null;
          setCurrentlyPlayingId(null);
          setTrackName(null);
          setArtistName(null);
          setArtworkUrl(null);
          setCurrentTrack(null);
          resetPlaybackState();
        }
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
      };
    },
    [resetPlaybackState]
  );

  const pause = useCallback(() => {
    stopAudio();
  }, [stopAudio]);

  const play = useCallback(
    (url: string, id: number, metadata?: TrackMetadata) => {
      // Clean up listeners on the old element before discarding it
      cleanupRef.current?.();
      cleanupRef.current = null;

      // Stop any currently playing audio and clean up old element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      resetPlaybackState();

      // Set track metadata
      setTrackName(metadata?.trackName || null);
      setArtistName(metadata?.artistName || null);
      setArtworkUrl(metadata?.artworkUrl || null);
      setCurrentTrack(metadata?.fullTrack || null);

      const audio = new Audio(url);
      audio.volume = volumeRef.current;
      audioRef.current = audio;
      setCurrentlyPlayingId(id);

      cleanupRef.current = attachListeners(audio);

      audio.play().catch(() => {
        // Browser blocked autoplay or URL failed - reset state
        if (audioRef.current === audio) {
          cleanupRef.current?.();
          cleanupRef.current = null;
          audioRef.current = null;
          setCurrentlyPlayingId(null);
          setTrackName(null);
          setArtistName(null);
          setArtworkUrl(null);
          setCurrentTrack(null);
          resetPlaybackState();
        }
      });
    },
    [attachListeners, resetPlaybackState]
  );

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    volumeRef.current = clamped;
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

  return (
    <AudioPlayerContext.Provider
      value={{
        play,
        pause,
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
