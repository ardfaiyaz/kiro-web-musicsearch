"use client";

import { useState, useEffect, useRef } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";

export default function AudioPlayer({
  previewUrl,
  trackId,
  trackName,
}: {
  previewUrl: string | null;
  trackId: number;
  trackName: string;
}) {
  const { play, pause, currentlyPlayingId } = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Poll to check if this track is still playing
    intervalRef.current = setInterval(() => {
      const playing = currentlyPlayingId.current === trackId;
      setIsPlaying(playing);
    }, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentlyPlayingId, trackId]);

  if (!previewUrl) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <svg
          className="h-5 w-5 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636"
          />
        </svg>
        <span className="text-sm text-muted">Preview not available</span>
      </div>
    );
  }

  function handleToggle() {
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      play(previewUrl!, trackId);
      setIsPlaying(true);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <button
        onClick={handleToggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"
        aria-label={isPlaying ? `Pause ${trackName}` : `Play ${trackName} preview`}
      >
        {isPlaying ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {isPlaying ? "Playing" : "30-second preview"}
        </span>
        <span className="text-xs text-muted">
          {isPlaying ? "Click to pause" : "Click to play"}
        </span>
      </div>
    </div>
  );
}
