"use client";

import { useMemo, useCallback } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface ContinueListeningProps {
  history: HistoryEntry[];
  onDismiss: (trackId: number, playedAt: number) => void;
}

function formatTimeRemaining(durationMs: number, progress: number): string {
  const remainingMs = durationMs * ((100 - progress) / 100);
  const seconds = Math.floor(remainingMs / 1000);
  if (seconds < 60) return `${seconds}s left`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")} left`;
}

export default function ContinueListening({ history, onDismiss }: ContinueListeningProps) {
  const unfinishedTracks = useMemo(() => {
    return history
      .filter((e) => !e.completed && e.progress < 100 && e.progress > 0)
      .slice(0, 6);
  }, [history]);

  const handleResume = useCallback((entry: HistoryEntry) => {
    if (entry.previewUrl) {
      window.open(entry.previewUrl, "_blank", "noopener");
    }
  }, []);

  if (unfinishedTracks.length === 0) return null;

  return (
    <section aria-label="Continue listening" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Continue Listening
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {unfinishedTracks.map((entry) => (
          <article
            key={`${entry.trackId}-${entry.playedAt}`}
            className="group relative rounded-2xl glass-heavy p-4 transition-premium hover:shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={entry.artworkUrl.replace("100x100", "200x200")}
                  alt={`${entry.trackName} artwork`}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-foreground">
                  {entry.trackName}
                </h4>
                <p className="truncate text-xs text-muted">
                  {entry.artistName} &middot; {entry.albumName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(entry.trackId, entry.playedAt)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-muted transition-premium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                aria-label={`Dismiss ${entry.trackName}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-3 space-y-1">
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
                role="progressbar"
                aria-valuenow={Math.round(entry.progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${Math.round(entry.progress)}% completed`}
              >
                <div
                  className="h-full rounded-full bg-foreground/60 transition-all"
                  style={{ width: `${entry.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  {formatTimeRemaining(entry.duration, entry.progress)}
                </span>
                <button
                  type="button"
                  onClick={() => handleResume(entry)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground transition-premium hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                  aria-label={`Resume playing ${entry.trackName}`}
                >
                  <Play className="h-3 w-3" aria-hidden="true" />
                  Resume
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
