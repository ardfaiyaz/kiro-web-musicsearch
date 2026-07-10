"use client";

import { useRef } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { ItunesTrack } from "@/lib/types";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatRemainingTime(current: number, total: number): string {
  if (!isFinite(total) || total <= 0) return "-0:00";
  const remaining = Math.max(0, total - current);
  return `-${formatTime(remaining)}`;
}

export default function AudioPlayer({
  previewUrl,
  trackId,
  trackName,
  artistName,
  artworkUrl,
  compact = false,
  track,
}: {
  previewUrl: string | null;
  trackId: number;
  trackName: string;
  artistName?: string;
  artworkUrl?: string;
  compact?: boolean;
  track?: ItunesTrack;
}) {
  const {
    play,
    pause,
    resume,
    isPlaying: contextIsPlaying,
    currentlyPlayingId,
    currentTime,
    duration,
    volume,
    progress,
    setVolume,
    seekTo,
  } = useAudioPlayer();

  const isActiveTrack = currentlyPlayingId === trackId;
  const isPlaying = isActiveTrack && contextIsPlaying;
  const previousVolumeRef = useRef(1);

  if (!previewUrl) {
    if (compact) {
      return (
        <span className="text-xs text-muted" aria-label="Preview not available">
          --
        </span>
      );
    }
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 px-5 py-4">
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
    } else if (isActiveTrack) {
      resume();
    } else {
      play(previewUrl!, trackId, { trackName, artistName, artworkUrl, fullTrack: track });
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const newProgress = parseFloat(e.target.value);
    if (duration > 0) {
      const newTime = (newProgress / 100) * duration;
      seekTo(newTime);
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(parseFloat(e.target.value));
  }

  function handleMuteToggle() {
    if (volume > 0) {
      previousVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(previousVolumeRef.current);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-foreground/80"
        aria-label={isPlaying ? `Pause ${trackName}` : `Play ${trackName} preview`}
      >
        {isPlaying ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <section
      aria-label={`Audio player for ${trackName}`}
      className="glass rounded-2xl px-5 py-5 sm:px-6"
    >
      <div className="flex flex-col gap-4">
        {/* Controls row */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggle}
            className="cursor-pointer flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all hover:scale-105 hover:bg-foreground/80"
            aria-label={isPlaying ? `Pause ${trackName}` : `Play ${trackName} preview`}
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <time
                className="w-10 text-xs tabular-nums text-muted"
                aria-label="Current playback time"
              >
                {isActiveTrack ? formatTime(currentTime) : "0:00"}
              </time>

              <label className="sr-only" htmlFor={`progress-${trackId}`}>
                Playback progress
              </label>
              <div className="relative flex-1">
                <input
                  id={`progress-${trackId}`}
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={isActiveTrack ? progress : 0}
                  onChange={handleSeek}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-md"
                  aria-label={`Seek ${trackName} preview`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={isActiveTrack ? Math.round(progress) : 0}
                />
              </div>

              <time
                className="w-12 text-right text-xs tabular-nums text-muted"
                aria-label="Remaining time"
              >
                {isActiveTrack ? formatRemainingTime(currentTime, duration) : "-0:30"}
              </time>
            </div>
          </div>
        </div>

        {/* Volume control */}
        <div
          className="flex items-center gap-3"
          role="group"
          aria-label="Volume controls"
        >
          <button
            onClick={handleMuteToggle}
            className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : volume < 0.5 ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728" />
              </svg>
            )}
          </button>

          <label className="sr-only" htmlFor={`volume-${trackId}`}>
            Volume
          </label>
          <input
            id={`volume-${trackId}`}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-border sm:w-28 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
            aria-label="Adjust volume"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={Math.round(volume * 100) / 100}
          />

          <span className="ml-auto truncate text-xs text-muted">
            {isActiveTrack ? "Now playing" : "30-second preview"}
          </span>
        </div>
      </div>
    </section>
  );
}
