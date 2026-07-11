"use client";

import { useMemo } from "react";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeTopArtists } from "@/lib/analytics";

interface TopArtistsChartProps {
  history: HistoryEntry[];
}

export default function TopArtistsChart({ history }: TopArtistsChartProps) {
  const topArtists = useMemo(() => computeTopArtists(history, 10), [history]);

  if (topArtists.length === 0) return null;

  return (
    <section aria-label="Top artists" className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">Top Artists</h3>
      </div>

      <div className="space-y-2" role="list" aria-label="Top artists ranking">
        {topArtists.map((artist, index) => (
          <div
            key={artist.artistName}
            role="listitem"
            className="flex items-center gap-3 rounded-xl glass-light p-3 transition-premium hover:glass-medium"
          >
            {/* Rank */}
            <span className="w-6 text-center text-sm font-bold text-muted">
              {index + 1}
            </span>

            {/* Avatar circle with first letter */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-sm font-bold text-foreground"
              aria-hidden="true"
            >
              {artist.artistName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {artist.artistName}
              </p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {artist.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] text-muted"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden shrink-0 text-right sm:block">
              <span className="block text-xs font-medium text-foreground">
                {artist.playCount} plays
              </span>
              <span className="text-[10px] text-muted">
                {artist.totalHours}h &middot; {artist.albums} albums
              </span>
            </div>

            {/* Trend */}
            <span className="shrink-0" aria-hidden="true">
              {index < 3 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : index > 7 ? (
                <TrendingDown className="h-4 w-4 text-red-400" />
              ) : (
                <Minus className="h-4 w-4 text-muted" />
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
