"use client";

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  ReactNode,
} from "react";

interface AudioPlayerContextType {
  play: (url: string, id: number) => void;
  pause: () => void;
  currentlyPlayingId: number | null;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(
    null
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentlyPlayingId(null);
  }, []);

  const play = useCallback((url: string, id: number) => {
    // Stop any currently playing audio and clean up old element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("data-track-id");
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audio.setAttribute("data-track-id", String(id));
    audioRef.current = audio;
    setCurrentlyPlayingId(id);

    audio.play().catch(() => {
      // Browser blocked autoplay or URL failed - reset state
      if (audioRef.current === audio) {
        audioRef.current = null;
        setCurrentlyPlayingId(null);
      }
    });

    audio.addEventListener("ended", () => {
      // Guard: only reset state if this audio element is still the active one
      if (audioRef.current === audio) {
        audioRef.current = null;
        setCurrentlyPlayingId(null);
      }
    });
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ play, pause, currentlyPlayingId }}>
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
