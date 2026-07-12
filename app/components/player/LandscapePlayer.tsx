"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { SkipBack, SkipForward, Shuffle, Repeat, Repeat1, X } from "lucide-react";
import { useAudioPlayer } from "../AudioPlayerContext";
import { useDynamicColors } from "../DynamicColorProvider";

const LANDSCAPE_QUERY = "(orientation: landscape) and (max-height: 500px)";

function subscribeLandscape(callback: () => void) {
  const mq = window.matchMedia(LANDSCAPE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getLandscapeSnapshot() {
  return window.matchMedia(LANDSCAPE_QUERY).matches;
}

function getLandscapeServerSnapshot() {
  return false;
}

/**
 * LandscapePlayer - detects landscape orientation via matchMedia and
 * shows an immersive fullscreen player with large artwork and
 * controls spread across the width.
 */
export default function LandscapePlayer() {
  const isLandscape = useSyncExternalStore(
    subscribeLandscape,
    getLandscapeSnapshot,
    getLandscapeServerSnapshot
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const {
    currentlyPlayingId,
    trackName,
    artistName,
    artworkUrl,
    isPlaying,
    pause,
    resume,
    playNext,
    previousTrack,
    shuffleMode,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    progress,
    currentTime,
    duration,
    seekTo,
    queue,
  } = useAudioPlayer();
  const { colors } = useDynamicColors();

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      seekTo((value / 100) * duration);
    },
    [seekTo, duration]
  );

  if (!isLandscape || !currentlyPlayingId || isDismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center"
      style={{
        background: colors
          ? `linear-gradient(135deg, ${colors.dominant}dd, ${colors.palette[1] || "#000"}ee)`
          : "linear-gradient(135deg, #1a1a2e, #0f0f1a)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Landscape player"
    >
      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Close landscape player"
      >
        <X size={16} />
      </button>

      <div className="flex h-full w-full items-center gap-6 px-6 py-4">
        {/* Artwork */}
        <div className="relative h-[80%] aspect-square shrink-0 overflow-hidden rounded-xl shadow-2xl">
          {artworkUrl ? (
            <Image
              src={artworkUrl.replace("100x100", "600x600")}
              alt={trackName ? `${trackName} artwork` : "Album artwork"}
              fill
              sizes="200px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/10">
              <svg
                className="h-12 w-12 text-white/40"
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

        {/* Controls section */}
        <div className="flex flex-1 flex-col justify-center gap-3 text-white">
          {/* Track info */}
          <div>
            <h2 className="truncate text-lg font-bold">{trackName || "Unknown Track"}</h2>
            <p className="truncate text-sm text-white/70">{artistName || "Unknown Artist"}</p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60 min-w-[36px]">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1 appearance-none rounded-full bg-white/20 accent-white cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              aria-label="Seek position"
            />
            <span className="text-xs text-white/60 min-w-[36px]">{formatTime(duration)}</span>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                shuffleMode ? "text-white" : "text-white/50"
              }`}
              aria-label={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={previousTrack}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
              aria-label="Previous track"
            >
              <SkipBack size={20} className="fill-current" />
            </button>
            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"
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
            <button
              onClick={playNext}
              disabled={queue.length === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-40"
              aria-label="Next track"
            >
              <SkipForward size={20} className="fill-current" />
            </button>
            <button
              onClick={cycleRepeatMode}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                repeatMode !== "off" ? "text-white" : "text-white/50"
              }`}
              aria-label={`Repeat: ${repeatMode}`}
            >
              {repeatMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
