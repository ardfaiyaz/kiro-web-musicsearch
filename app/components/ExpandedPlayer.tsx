"use client";

import Image from "next/image";
import { useRef, useEffect, useCallback, useState } from "react";
import {
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  GripVertical,
  Mic2,
} from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useDynamicColors } from "./DynamicColorProvider";
import ProgressBar from "./player/ProgressBar";
import VolumeControl from "./player/VolumeControl";
import SleepTimerPopover from "./player/SleepTimerPopover";

function WaveformVisualization({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsDataRef = useRef<number[]>(Array.from({ length: 32 }, () => 30));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const barCount = 32;
    const barWidth = rect.width / barCount - 2;
    const maxHeight = rect.height;

    let lastTime = 0;

    const animate = (time: number) => {
      if (time - lastTime > 50) {
        lastTime = time;
        ctx.clearRect(0, 0, rect.width, rect.height);

        for (let i = 0; i < barCount; i++) {
          const target = isPlaying ? 20 + Math.random() * 80 : 30;
          barsDataRef.current[i] +=
            (target - barsDataRef.current[i]) * 0.3;

          const height = (barsDataRef.current[i] / 100) * maxHeight;
          const x = i * (barWidth + 2);
          const y = maxHeight - height;

          ctx.fillStyle = "currentColor";
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, height, barWidth / 2);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="h-16 w-full"
      style={{ color: "inherit" }}
      aria-hidden="true"
    />
  );
}

interface DraggableQueueProps {
  queue: ReturnType<typeof useAudioPlayer>["queue"];
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
}

function DraggableQueue({
  queue,
  removeFromQueue,
  reorderQueue,
}: DraggableQueueProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    []
  );

  const handleDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    []
  );

  const handleDrop = useCallback(
    (toIndex: number) => (e: React.DragEvent) => {
      e.preventDefault();
      const fromIndex = Number(e.dataTransfer.getData("text/plain"));
      if (fromIndex !== toIndex) {
        reorderQueue(fromIndex, toIndex);
      }
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [reorderQueue]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  // Touch drag state
  const touchStartRef = useRef<{ index: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (index: number) => (e: React.TouchEvent) => {
      touchStartRef.current = { index, y: e.touches[0].clientY };
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const startY = touchStartRef.current.y;
      const endY = e.changedTouches[0].clientY;
      const diff = endY - startY;
      const fromIndex = touchStartRef.current.index;

      // Approximate moving one position per 60px of drag
      if (Math.abs(diff) > 30) {
        const positions = Math.round(diff / 60);
        const toIndex = Math.max(
          0,
          Math.min(queue.length - 1, fromIndex + positions)
        );
        if (fromIndex !== toIndex) {
          reorderQueue(fromIndex, toIndex);
        }
      }
      touchStartRef.current = null;
    },
    [queue.length, reorderQueue]
  );

  return (
    <ul className="flex flex-col gap-2" role="list" aria-label="Queue tracks">
      {queue.slice(0, 8).map((track, index) => (
        <li
          key={`${track.trackId}-${index}`}
          draggable
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver(index)}
          onDrop={handleDrop(index)}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart(index)}
          onTouchEnd={handleTouchEnd}
          className={`flex items-center gap-3 rounded-xl bg-surface/50 px-3 py-2 transition-all ${
            dragIndex === index ? "opacity-50 scale-95" : ""
          } ${dragOverIndex === index && dragIndex !== index ? "border-t-2 border-foreground/30" : ""}`}
        >
          <div
            className="flex shrink-0 cursor-grab items-center text-muted active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </div>
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
      {queue.length > 8 && (
        <li className="py-1 text-center text-xs text-muted">
          +{queue.length - 8} more tracks
        </li>
      )}
    </ul>
  );
}

export default function ExpandedPlayer() {
  const {
    currentlyPlayingId,
    trackName,
    artistName,
    artworkUrl,
    currentTrack,
    isPlaying,
    pause,
    resume,
    isExpanded,
    toggleExpanded,
    queue,
    removeFromQueue,
    reorderQueue,
    playNext,
    previousTrack,
    shuffleMode,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
  } = useAudioPlayer();
  const { colors } = useDynamicColors();
  const [showLyrics, setShowLyrics] = useState(false);

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

  const handleToggleLyrics = useCallback(() => {
    setShowLyrics((prev) => !prev);
  }, []);

  if (!isExpanded || !currentlyPlayingId) return null;

  const dominantColor = colors?.dominant || "#6366f1";
  const albumName = currentTrack?.collectionName || "Unknown Album";

  const repeatIcon =
    repeatMode === "one" ? (
      <Repeat1 className="h-5 w-5" aria-hidden="true" />
    ) : (
      <Repeat className="h-5 w-5" aria-hidden="true" />
    );

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
          <div className="flex items-center gap-2">
            {/* Lyrics toggle */}
            <button
              onClick={handleToggleLyrics}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                showLyrics
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              aria-label={showLyrics ? "Hide lyrics" : "Show lyrics"}
              aria-pressed={showLyrics}
            >
              <Mic2 className="h-4 w-4" aria-hidden="true" />
            </button>
            {/* Sleep timer */}
            <SleepTimerPopover />
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-8 sm:gap-8">
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
          {!showLyrics && (
            <div className="w-full max-w-sm" style={{ color: dominantColor }}>
              <WaveformVisualization isPlaying={isPlaying} />
            </div>
          )}

          {/* Lyrics display (simple placeholder - integrates with existing lyrics fetching) */}
          {showLyrics && (
            <div className="w-full max-w-sm rounded-xl bg-surface/30 p-4 text-center">
              <p className="text-sm text-muted">
                Lyrics available on track detail page
              </p>
              <p className="mt-1 text-xs text-muted/70">
                Tap the track name to view full lyrics
              </p>
            </div>
          )}

          {/* Interactive Progress Bar */}
          <ProgressBar />

          {/* Playback controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                shuffleMode
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              aria-label={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
              aria-pressed={shuffleMode}
            >
              <Shuffle className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Previous */}
            <button
              onClick={previousTrack}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-premium hover:scale-105"
              aria-label="Previous track"
            >
              <SkipBack className="h-5 w-5 fill-current" aria-hidden="true" />
            </button>

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
              <SkipForward
                className="h-5 w-5 fill-current"
                aria-hidden="true"
              />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                repeatMode !== "off"
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              aria-label={`Repeat mode: ${repeatMode}`}
            >
              {repeatIcon}
            </button>
          </div>

          {/* Volume control */}
          <VolumeControl />

          {/* Queue display with drag and drop */}
          {queue.length > 0 && (
            <div className="w-full max-w-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Up Next ({queue.length})
              </h3>
              <DraggableQueue
                queue={queue}
                removeFromQueue={removeFromQueue}
                reorderQueue={reorderQueue}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
