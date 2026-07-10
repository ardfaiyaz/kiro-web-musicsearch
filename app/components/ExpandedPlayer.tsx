"use client";

import Image from "next/image";
import { useRef, useEffect, useCallback } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useDynamicColors } from "./DynamicColorProvider";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function WaveformVisualization({ isPlaying }: { isPlaying: boolean }) {
  const barsRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || !barsRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const bars = barsRef.current.children;
    const barCount = bars.length;

    // Throttle to ~20fps for performance
    let lastTime = 0;
    const throttledAnimate = (time: number) => {
      if (time - lastTime > 50) {
        lastTime = time;
        for (let i = 0; i < barCount; i++) {
          const bar = bars[i] as HTMLElement;
          const height = 20 + Math.random() * 80;
          bar.style.height = `${height}%`;
        }
      }
      animationRef.current = requestAnimationFrame(throttledAnimate);
    };

    animationRef.current = requestAnimationFrame(throttledAnimate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying]);

  // Reset bars to static state when not playing
  useEffect(() => {
    if (!isPlaying && barsRef.current) {
      const bars = barsRef.current.children;
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i] as HTMLElement;
        bar.style.height = "30%";
      }
    }
  }, [isPlaying]);

  return (
    <div
      ref={barsRef}
      className="flex h-16 items-end justify-center gap-[3px]"
      aria-hidden="true"
    >
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-current opacity-60 transition-[height] duration-100"
          style={{ height: "30%" }}
        />
      ))}
    </div>
  );
}

export default function ExpandedPlayer() {
  const {
    currentlyPlayingId,
    trackName,
    artistName,
    artworkUrl,
    currentTrack,
    currentTime,
    duration,
    volume,
    progress,
    isPlaying,
    pause,
    resume,
    seekTo,
    setVolume,
    isExpanded,
    toggleExpanded,
    queue,
    removeFromQueue,
    playNext,
  } = useAudioPlayer();
  const { colors } = useDynamicColors();
  const seekBarRef = useRef<HTMLInputElement>(null);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = (Number(e.target.value) / 100) * duration;
      seekTo(time);
    },
    [duration, seekTo]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(Number(e.target.value) / 100);
    },
    [setVolume]
  );

  // Close on escape
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleExpanded();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, toggleExpanded]);

  // Lock body scroll when expanded
  useEffect(() => {
    if (!isExpanded) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isExpanded]);

  if (!isExpanded || !currentlyPlayingId) return null;

  const dominantColor = colors?.dominant || "#6366f1";
  const albumName = currentTrack?.collectionName || "Unknown Album";

  return (
    <div
      className="fixed inset-0 z-[55] flex flex-col animate-slide-up-full"
      role="dialog"
      aria-modal="true"
      aria-label="Expanded player"
    >
      {/* Dynamic background */}
      <div className="absolute inset-0 bg-background">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${dominantColor} 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at 80% 80%, ${colors?.palette?.[1] || dominantColor} 0%, transparent 50%)`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col overflow-y-auto">
        {/* Header with close button */}
        <header className="flex items-center justify-between px-6 py-4">
          <button
            onClick={toggleExpanded}
            className="flex h-10 w-10 items-center justify-center rounded-full glass-fab text-foreground transition-premium hover:scale-105"
            aria-label="Collapse player"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Now Playing
          </span>
          <div className="w-10" />
        </header>

        {/* Main content area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-8">
          {/* Large artwork */}
          <div className="relative aspect-square w-full max-w-xs sm:max-w-sm">
            {/* Glow behind artwork */}
            <div
              className="absolute inset-4 rounded-3xl opacity-50 blur-3xl"
              style={{ backgroundColor: dominantColor }}
              aria-hidden="true"
            />
            <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl">
              {artworkUrl ? (
                <Image
                  src={artworkUrl.replace("100x100", "600x600")}
                  alt={`${trackName || "Track"} artwork`}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface">
                  <svg
                    className="h-20 w-20 text-muted"
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
          <div className="w-full max-w-sm text-center">
            <h2 className="truncate text-xl font-bold text-foreground sm:text-2xl">
              {trackName || "Unknown Track"}
            </h2>
            <p className="mt-1 truncate text-sm text-muted sm:text-base">
              {artistName || "Unknown Artist"}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted/70">{albumName}</p>
          </div>

          {/* Waveform Visualization */}
          <div className="w-full max-w-sm" style={{ color: dominantColor }}>
            <WaveformVisualization isPlaying={isPlaying} />
          </div>

          {/* Seek bar */}
          <div className="w-full max-w-sm">
            <input
              ref={seekBarRef}
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              className="w-full accent-foreground"
              aria-label="Seek"
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-6">
            {/* Play/Pause toggle */}
            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background transition-premium hover:scale-105"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip next */}
            <button
              onClick={playNext}
              disabled={queue.length === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-premium hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Skip to next track"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 4l10 8-10 8V4zm11 0h3v16h-3V4z" />
              </svg>
            </button>
          </div>

          {/* Volume control */}
          <div className="flex w-full max-w-sm items-center gap-3">
            <svg
              className="h-4 w-4 shrink-0 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={handleVolumeChange}
              className="flex-1 accent-foreground"
              aria-label="Volume"
            />
            <span className="w-8 text-right text-xs text-muted">
              {Math.round(volume * 100)}
            </span>
          </div>

          {/* Queue display */}
          {queue.length > 0 && (
            <div className="w-full max-w-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Up Next ({queue.length})
              </h3>
              <ul className="flex flex-col gap-2">
                {queue.slice(0, 5).map((track, index) => (
                  <li
                    key={`${track.trackId}-${index}`}
                    className="flex items-center gap-3 rounded-xl bg-surface/50 px-3 py-2"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={track.artworkUrl100}
                        alt={`${track.trackName} artwork`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {track.trackName}
                      </span>
                      <span className="truncate text-xs text-muted">
                        {track.artistName}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromQueue(index)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-premium hover:bg-surface hover:text-foreground"
                      aria-label={`Remove ${track.trackName} from queue`}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
                {queue.length > 5 && (
                  <li className="py-1 text-center text-xs text-muted">
                    +{queue.length - 5} more tracks
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
