"use client";

import Image from "next/image";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useDynamicColors } from "./DynamicColorProvider";

export default function MiniPlayer() {
  const {
    currentlyPlayingId,
    trackName,
    artistName,
    artworkUrl,
    progress,
    pause,
  } = useAudioPlayer();
  const { colors } = useDynamicColors();

  if (!currentlyPlayingId) return null;

  return (
    <aside
      aria-label="Mini player"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl glass-player shadow-2xl transition-premium"
    >
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden rounded-t-2xl bg-foreground/10">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            backgroundColor: colors?.dominant || "var(--foreground)",
            opacity: 0.8,
          }}
        />
      </div>

      <div className="flex items-center gap-4 px-5 py-3">
        {/* Artwork with dynamic color glow */}
        <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
          {colors && (
            <div
              className="absolute inset-0 rounded-xl opacity-50 blur-md"
              style={{ backgroundColor: colors.dominant }}
              aria-hidden="true"
            />
          )}
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-border shadow-lg">
            {artworkUrl ? (
              <Image
                src={artworkUrl}
                alt={trackName ? `${trackName} artwork` : "Track artwork"}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg
                  className="h-6 w-6 text-muted"
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
        </div>

        {/* Track info */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">
            {trackName || "Unknown Track"}
          </span>
          <span className="truncate text-xs text-muted">
            {artistName || "Unknown Artist"}
          </span>
        </div>

        {/* Pause button */}
        <button
          onClick={pause}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-premium hover:scale-105 hover:bg-foreground/90"
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
