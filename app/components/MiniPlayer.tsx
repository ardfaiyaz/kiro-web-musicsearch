"use client";

import Image from "next/image";
import { useAudioPlayer } from "./AudioPlayerContext";

export default function MiniPlayer() {
  const {
    currentlyPlayingId,
    trackName,
    artistName,
    artworkUrl,
    progress,
    pause,
  } = useAudioPlayer();

  if (!currentlyPlayingId) return null;

  return (
    <aside
      aria-label="Mini player"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-card/80 backdrop-blur-xl transition-all duration-300"
    >
      {/* Progress bar at top of mini player */}
      <div className="h-0.5 w-full bg-border">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        {/* Artwork */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-border sm:h-12 sm:w-12">
          {artworkUrl ? (
            <Image
              src={artworkUrl}
              alt={trackName ? `${trackName} artwork` : "Track artwork"}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
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
                  strokeWidth={1.5}
                  d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {trackName || "Unknown Track"}
          </span>
          <span className="truncate text-xs text-muted">
            {artistName || "Unknown Artist"}
          </span>
        </div>

        {/* Pause button */}
        <button
          onClick={pause}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"
          aria-label="Pause"
        >
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
