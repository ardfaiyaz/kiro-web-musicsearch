"use client";

import { useState, useRef, useEffect } from "react";

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
  const [currentLine, setCurrentLine] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    // If lyrics were passed as prop, skip fetching
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

  const lines = lyrics
    ? lyrics.split("\n").filter((line) => line.trim().length > 0)
    : [];

  const hasLyrics = lines.length > 0;

  useEffect(() => {
    if (!isAutoScrolling || !hasLyrics) return;

    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        const next = prev + 1;
        if (next >= lines.length) {
          setIsAutoScrolling(false);
          return 0;
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, hasLyrics, lines.length]);

  useEffect(() => {
    if (isAutoScrolling && lineRefs.current[currentLine]) {
      lineRefs.current[currentLine]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLine, isAutoScrolling]);

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="glass-stats p-6" aria-label="Lyrics loading">
        <h3 className="mb-4 text-lg font-bold text-foreground">Lyrics</h3>
        <div className="flex flex-col gap-3 py-4" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-surface"
              style={{ width: `${60 + Math.random() * 30}%` }}
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
            Lyrics are not available for this track at this time. Try again later or check a different track.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-stats p-6" aria-label="Lyrics">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Lyrics</h3>
        <button
          onClick={() => {
            setIsAutoScrolling(!isAutoScrolling);
            if (!isAutoScrolling) {
              setCurrentLine(0);
            }
          }}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition-premium hover:border-foreground/20 hover:text-foreground"
          aria-label={isAutoScrolling ? "Stop auto-scroll" : "Start auto-scroll"}
        >
          {isAutoScrolling ? "Stop" : "Auto-scroll"}
        </button>
      </div>
      <div
        ref={containerRef}
        className="lyrics-container max-h-80 overflow-y-auto scroll-smooth"
        role="region"
        aria-label={`Lyrics for ${trackName} by ${artistName}`}
      >
        <div className="flex flex-col gap-3 py-4">
          {lines.map((line, index) => (
            <p
              key={index}
              ref={(el) => {
                lineRefs.current[index] = el;
              }}
              className={`lyrics-line transition-all duration-300 ${
                isAutoScrolling && index === currentLine
                  ? "lyrics-line-active text-lg font-bold text-foreground"
                  : isAutoScrolling && Math.abs(index - currentLine) <= 2
                    ? "text-base text-muted"
                    : isAutoScrolling
                      ? "text-sm text-muted/50"
                      : "text-sm text-foreground/80"
              }`}
              onClick={() => {
                if (isAutoScrolling) {
                  setCurrentLine(index);
                }
              }}
              role={isAutoScrolling ? "button" : undefined}
              tabIndex={isAutoScrolling ? 0 : undefined}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
