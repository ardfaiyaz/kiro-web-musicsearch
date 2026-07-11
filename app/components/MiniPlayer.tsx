"use client";

import Image from "next/image";
import { useRef, useCallback, useState } from "react";
import {
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useDynamicColors } from "./DynamicColorProvider";
import AnimatedEqualizer from "./AnimatedEqualizer";
import dynamic from "next/dynamic";

const ExpandedPlayer = dynamic(() => import("./ExpandedPlayer"), {
  ssr: false,
});

export default function MiniPlayer() {
  const {
    currentlyPlayingId,
    trackName,
    artistName,
    artworkUrl,
    progress,
    isPlaying,
    pause,
    resume,
    isExpanded,
    toggleExpanded,
    playNext,
    previousTrack,
    shuffleMode,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    queue,
  } = useAudioPlayer();
  const { colors } = useDynamicColors();

  // Swipe gesture state
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setSwipeOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // Only handle horizontal swipes (ignore vertical for expand)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      setSwipeOffset(dx);
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      // Swipe up to expand
      if (dy < -60 && Math.abs(dy) > Math.abs(dx)) {
        toggleExpanded();
      }
      // Swipe left for next track
      else if (dx < -60 && Math.abs(dx) > Math.abs(dy) && queue.length > 0) {
        playNext();
      }
      // Swipe right for previous track
      else if (dx > 60 && Math.abs(dx) > Math.abs(dy)) {
        previousTrack();
      }

      touchStartRef.current = null;
      setSwipeOffset(0);
    },
    [toggleExpanded, playNext, previousTrack, queue.length]
  );

  if (!currentlyPlayingId) return null;

  const repeatIcon =
    repeatMode === "one" ? (
      <Repeat1 className="h-3.5 w-3.5" aria-hidden="true" />
    ) : (
      <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
    );

  return (
    <>
      <ExpandedPlayer />
      {!isExpanded && (
        <aside
          aria-label="Mini player"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl glass-player shadow-2xl transition-premium"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform:
              swipeOffset !== 0
                ? `translateX(${swipeOffset * 0.3}px)`
                : undefined,
          }}
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

          <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
            {/* Artwork with dynamic color glow - click to expand */}
            <button
              onClick={toggleExpanded}
              className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14"
              aria-label="Expand player"
            >
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
            </button>

            {/* Track info - click to expand */}
            <button
              onClick={toggleExpanded}
              className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
              aria-label="Expand player"
            >
              <span className="truncate text-sm font-semibold text-foreground">
                {trackName || "Unknown Track"}
              </span>
              <span className="flex items-center gap-2 truncate text-xs text-muted">
                <AnimatedEqualizer />
                {artistName || "Unknown Artist"}
              </span>
            </button>

            {/* Compact controls */}
            <div className="hidden items-center gap-1 sm:flex">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  shuffleMode
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
                aria-label={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
                aria-pressed={shuffleMode}
              >
                <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {/* Previous */}
              <button
                onClick={previousTrack}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
                aria-label="Previous track"
              >
                <SkipBack
                  className="h-3.5 w-3.5 fill-current"
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Play/Pause button */}
            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-premium hover:scale-105 hover:bg-foreground/90"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* More compact controls */}
            <div className="hidden items-center gap-1 sm:flex">
              {/* Next */}
              <button
                onClick={playNext}
                disabled={queue.length === 0}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next track"
              >
                <SkipForward
                  className="h-3.5 w-3.5 fill-current"
                  aria-hidden="true"
                />
              </button>

              {/* Repeat */}
              <button
                onClick={cycleRepeatMode}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  repeatMode !== "off"
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
                aria-label={`Repeat: ${repeatMode}`}
              >
                {repeatIcon}
              </button>
            </div>

            {/* Expand button */}
            <button
              onClick={toggleExpanded}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-premium hover:text-foreground icon-bounce"
              aria-label="Expand player"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
