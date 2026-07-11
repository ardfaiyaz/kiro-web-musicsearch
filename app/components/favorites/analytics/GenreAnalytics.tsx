"use client";

import { useMemo } from "react";
import { Palette } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeGenreAnalytics } from "@/lib/analytics";

interface GenreAnalyticsProps {
  history: HistoryEntry[];
}

function PercentageRing({
  percentage,
  size = 56,
}: {
  percentage: number;
  size?: number;
}) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="shrink-0 -rotate-90"
      role="img"
      aria-label={`${percentage}% of listening time`}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-foreground/10"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="text-foreground/70 transition-all duration-1000 ease-out"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export default function GenreAnalytics({ history }: GenreAnalyticsProps) {
  const genres = useMemo(() => computeGenreAnalytics(history), [history]);

  if (genres.length === 0) return null;

  return (
    <section aria-label="Genre analytics" className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Genre Analytics
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {genres.map((genre) => (
          <div
            key={genre.genre}
            className="flex items-center gap-3 rounded-xl glass-light p-4 transition-premium hover:glass-medium"
          >
            <PercentageRing percentage={genre.percentage} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {genre.genre}
              </p>
              <p className="text-xs text-muted">
                {genre.percentage}% &middot; {genre.hours}h
              </p>
              <p className="text-[10px] text-muted">
                {genre.songCount} songs &middot; {genre.artistCount} artists
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
