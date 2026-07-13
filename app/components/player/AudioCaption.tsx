"use client";

import { useAudioPlayer } from "../AudioPlayerContext";

export default function AudioCaption() {
  const { isPlaying, trackName, artistName, currentlyPlayingId } = useAudioPlayer();

  if (!currentlyPlayingId || !isPlaying) return null;

  return (
    <div
      className="fixed bottom-[140px] left-4 right-4 z-40 mx-auto max-w-md sm:bottom-24"
      role="status"
      aria-live="polite"
      aria-label="Audio caption"
    >
      <div className="rounded-lg bg-foreground/90 px-4 py-2 text-center shadow-lg">
        <p className="truncate text-sm font-medium text-background">
          {trackName || "Unknown Track"}
        </p>
        <p className="truncate text-xs text-background/70">
          {artistName || "Unknown Artist"}
        </p>
      </div>
    </div>
  );
}
