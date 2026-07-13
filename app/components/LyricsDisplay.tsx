"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useToast } from "./ToastContext";

interface LyricsDisplayProps {
  lyrics?: string | null;
  trackName: string;
  artistName: string;
}

export default function LyricsDisplay({
  lyrics: initialLyrics,
  trackName,
  artistName,
}: LyricsDisplayProps) {
  const [lyrics, setLyrics] = useState<string | null | undefined>(initialLyrics);
  const [isLoading, setIsLoading] = useState(!initialLyrics);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const { currentlyPlayingId, currentTime, duration, isPlaying, currentTrack } =
    useAudioPlayer();
  const { show } = useToast();

  const handleCopyLyrics = useCallback(async () => {
    if (!lyrics) return;
    try {
      await navigator.clipboard.writeText(lyrics);
      show("success", "Lyrics copied to clipboard!");
    } catch {
      show("error", "Failed to copy lyrics");
    }
  }, [lyrics, show]);

  useEffect(() => {
    if (initialLyrics) {
      setLyrics(initialLyrics);
      setIsLoading(false);
      return;
    }

    async function fetchLyrics() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/lyrics?artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}`
        );
        if (response.ok) {
          const data = await response.json();
          setLyrics(data.lyrics);
        } else {
          setLyrics(null);
        }
      } catch {
        setLyrics(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLyrics();
  }, [artistName, trackName, initialLyrics]);

  const lines = useMemo(
    () => (lyrics ? lyrics.split("\n").filter((line) => line.trim().length > 0) : []),
    [lyrics]
  );

  const hasLyrics = lines.length > 0;

  // Determine if the currently playing track matches this lyrics display
  const isTrackPlaying = useMemo(() => {
    if (!currentTrack || !currentlyPlayingId) return false;
    const nameMatch =
      currentTrack.trackName?.toLowerCase() === trackName.toLowerCase();
    const artistMatch =
      currentTrack.artistName?.toLowerCase() === artistName.toLowerCase();
    return nameMatch && artistMatch;
  }, [currentTrack, currentlyPlayingId, trackName, artistName]);

  // Calculate current line based on playback progress (even distribution)
  const currentLine = useMemo(() => {
    if (!isTrackPlaying || !isPlaying || lines.length === 0 || duration <= 0) {
      return -1;
    }
    const lineIndex = Math.floor((currentTime / duration) * lines.length);
    return Math.min(lineIndex, lines.length - 1);
  }, [isTrackPlaying, isPlaying, currentTime, duration, lines.length]);

  // Auto-scroll to current line when synced with audio
  useEffect(() => {
    if (currentLine >= 0 && lineRefs.current[currentLine]) {
      lineRefs.current[currentLine]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLine]);

  // Deterministic widths for loading skeleton
  const skeletonWidths = [75, 60, 85, 70, 65, 80, 55, 90];

  if (isLoading) {
    return (
      <section className="glass-stats p-6" aria-label="Lyrics loading">
        <h3 className="mb-4 text-lg font-bold text-foreground">Lyrics</h3>
        <div className="flex flex-col gap-3 py-4" aria-busy="true">
          {skeletonWidths.map((width, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-surface"
              style={{ width: `${width}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!hasLyrics) {
    return (
      <section className="glass-stats p-6" aria-label="Lyrics">
        <h3 className="mb-4 text-lg font-bold text-foreground">Lyrics</h3>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
            <svg
              className="h-8 w-8 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              Lyrics for &quot;{trackName}&quot;
            </p>
            <p className="text-xs text-muted">by {artistName}</p>
          </div>
          <p className="max-w-xs text-xs text-muted">
            Lyrics are not available for this track at this time. Try again
            later or check a different track.
          </p>
        </div>
      </section>
    );
  }

  const isSynced = currentLine >= 0;

  return (
    <section className="glass-stats p-6" aria-label="Lyrics">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Lyrics</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLyrics}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-foreground hover:bg-surface"
            aria-label="Copy lyrics to clipboard"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
              />
            </svg>
            Copy
          </button>
          {isSynced && (
            <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
              <span
                className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"
                aria-hidden="true"
              />
              Synced
            </span>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="lyrics-container max-h-80 overflow-y-auto scroll-smooth"
        role="region"
        aria-label={`Lyrics for ${trackName} by ${artistName}`}
      >
        <div className="flex flex-col gap-3 py-4">
          {lines.map((line, index) => {
            const isActive = isSynced && index === currentLine;
            const isNearby = isSynced && Math.abs(index - currentLine) <= 2;
            const isPast = isSynced && index < currentLine;

            return (
              <p
                key={index}
                ref={(el) => {
                  lineRefs.current[index] = el;
                }}
                className={`lyrics-line transition-all duration-500 ${
                  isActive
                    ? "scale-[1.02] text-lg font-bold text-foreground"
                    : isNearby
                      ? "text-base text-muted"
                      : isPast
                        ? "text-sm text-muted/40"
                        : isSynced
                          ? "text-sm text-muted/50"
                          : "text-sm text-foreground/80"
                }`}
                style={
                  isActive
                    ? {
                        textShadow: "0 0 20px var(--dynamic-accent, rgba(99,102,241,0.3))",
                        color: "var(--dynamic-accent, var(--foreground))",
                      }
                    : undefined
                }
                aria-current={isActive ? "true" : undefined}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
