"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Music, TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeTopSongs } from "@/lib/analytics";

interface TopSongsChartProps {
  history: HistoryEntry[];
}

export default function TopSongsChart({ history }: TopSongsChartProps) {
  const [showAll, setShowAll] = useState(false);

  const topSongs = useMemo(() => computeTopSongs(history, 20), [history]);

  const displayedSongs = showAll ? topSongs : topSongs.slice(0, 10);

  if (topSongs.length === 0) return null;

  return (
    <section aria-label="Top songs" className="space-y-4">
      <div className="flex items-center gap-2">
        <Music className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">Top Songs</h3>
      </div>

      <div className="space-y-2" role="list" aria-label="Top songs ranking">
        {displayedSongs.map((song, index) => (
          <div
            key={song.trackId}
            role="listitem"
            className="flex items-center gap-3 rounded-xl glass-subtle p-3 transition-premium hover:glass-light"
          >
            {/* Rank */}
            <span className="w-6 text-center text-sm font-bold text-muted">
              {index + 1}
            </span>

            {/* Artwork */}
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={song.artworkUrl.replace("100x100", "100x100")}
                alt={`${song.trackName} artwork`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {song.trackName}
              </p>
              <p className="truncate text-xs text-muted">{song.artistName}</p>
            </div>

            {/* Play count */}
            <span className="shrink-0 rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
              {song.playCount} {song.playCount === 1 ? "play" : "plays"}
            </span>

            {/* Total time */}
            <span className="hidden shrink-0 text-xs text-muted sm:block">
              {formatDuration(song.totalListeningMs)}
            </span>

            {/* Trend indicator */}
            <span className="shrink-0" aria-hidden="true">
              {index < 3 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : index > topSongs.length - 4 ? (
                <TrendingDown className="h-4 w-4 text-red-400" />
              ) : (
                <Minus className="h-4 w-4 text-muted" />
              )}
            </span>
          </div>
        ))}
      </div>

      {topSongs.length > 10 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="flex w-full items-center justify-center gap-1 rounded-xl glass-subtle px-4 py-3 text-sm font-medium text-muted transition-premium hover:text-foreground min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          aria-expanded={showAll}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
          {showAll ? "Show Less" : `Show All ${topSongs.length} Songs`}
        </button>
      )}
    </section>
  );
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours}h ${remainingMin}m`;
}
