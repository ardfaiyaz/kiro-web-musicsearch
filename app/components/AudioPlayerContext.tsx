"use client";

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from "react";

interface AudioPlayerContextType {
  play: (url: string, id: number) => void;
  pause: () => void;
  currentlyPlayingId: React.RefObject<number | null>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentlyPlayingId = useRef<number | null>(null);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    currentlyPlayingId.current = null;
  }, []);

  const play = useCallback(
    (url: string, id: number) => {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      currentlyPlayingId.current = id;
      audio.play();

      audio.addEventListener("ended", () => {
        currentlyPlayingId.current = null;
        audioRef.current = null;
      });
    },
    []
  );

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
