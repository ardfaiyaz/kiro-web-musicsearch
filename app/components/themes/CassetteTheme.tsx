"use client";

import { useAudioPlayer } from "../AudioPlayerContext";
import Image from "next/image";

/**
 * CassetteTheme - Retro cassette player UI theme.
 * Shows tape reels (rotating), physical-style buttons, and VHS scanlines overlay.
 * Togglable from settings. Replaces the standard player UI when enabled.
 */
export default function CassetteTheme() {
  const {
    isPlaying,
    trackName,
    artistName,
    artworkUrl,
    progress,
    pause,
    resume,
    playNext,
    previousTrack,
  } = useAudioPlayer();

  return (
    <div className="cassette-player glass-heavy rounded-2xl p-4 sm:p-6 w-full max-w-lg mx-auto relative overflow-hidden">
      {/* VHS Scanlines overlay */}
      <div className="cassette-scanlines absolute inset-0 pointer-events-none z-10" />

      {/* Cassette body */}
      <div className="relative z-20">
        {/* Label area */}
        <div className="cassette-label rounded-xl p-3 sm:p-4 mb-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50">
          <div className="flex items-center gap-3">
            {/* Mini artwork */}
            {artworkUrl && (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                <Image
                  src={artworkUrl}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-amber-900 dark:text-amber-100 uppercase tracking-wider font-mono">
                {trackName || "No Track"}
              </p>
              <p className="truncate text-[10px] text-amber-700 dark:text-amber-300 font-mono">
                {artistName || "Unknown Artist"}
              </p>
            </div>
          </div>
        </div>

        {/* Tape window showing reels */}
        <div className="cassette-window rounded-lg bg-zinc-900 p-3 sm:p-4 mb-4 flex items-center justify-center gap-6 sm:gap-10">
          {/* Left reel */}
          <div className={`cassette-reel ${isPlaying ? "cassette-reel-spinning" : ""}`}>
            <div className="cassette-reel-inner">
              <div className="cassette-spoke" />
              <div className="cassette-spoke cassette-spoke-2" />
              <div className="cassette-spoke cassette-spoke-3" />
            </div>
          </div>

          {/* Tape strip between reels */}
          <div className="cassette-tape-strip">
            <div
              className="cassette-tape-progress"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Right reel */}
          <div className={`cassette-reel ${isPlaying ? "cassette-reel-spinning" : ""}`}>
            <div className="cassette-reel-inner">
              <div className="cassette-spoke" />
              <div className="cassette-spoke cassette-spoke-2" />
              <div className="cassette-spoke cassette-spoke-3" />
            </div>
          </div>
        </div>

        {/* Physical style buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {/* Rewind/Previous */}
          <button
            onClick={previousTrack}
            className="cassette-btn cassette-btn-secondary"
            aria-label="Previous track (rewind)"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={isPlaying ? pause : resume}
            className="cassette-btn cassette-btn-primary"
            aria-label={isPlaying ? "Pause" : "Play"}
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

          {/* Fast Forward/Next */}
          <button
            onClick={playNext}
            className="cassette-btn cassette-btn-secondary"
            aria-label="Next track (fast forward)"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
