"use client";

import { useMemo } from "react";
import { Palette } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeGenreAnalytics } from "@/lib/analytics";

interface GenreAnalyticsProps {
  history: HistoryEntry[];
}

const GENRE_COLORS = [
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo
];

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

function GenrePieChart({
  genres,
}: {
  genres: { genre: string; percentage: number }[];
}) {
  const conicGradient = useMemo(() => {
    let accumulated = 0;
    const stops: string[] = [];

    for (let i = 0; i < genres.length; i++) {
      const color = GENRE_COLORS[i % GENRE_COLORS.length];
      const start = accumulated;
      const end = accumulated + genres[i].percentage;
      stops.push(`${color} ${start}% ${end}%`);
      accumulated = end;
    }

    // Fill remaining with transparent
    if (accumulated < 100) {
      stops.push(`rgba(255,255,255,0.05) ${accumulated}% 100%`);
    }

    return `conic-gradient(${stops.join(", ")})`;
  }, [genres]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pie chart */}
      <div
        className="h-40 w-40 rounded-full shadow-lg relative"
        style={{ background: conicGradient }}
        role="img"
        aria-label="Genre distribution pie chart"
      >
        <div className="absolute inset-4 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-bold text-foreground">
              {genres.length}
            </p>
            <p className="text-[10px] text-muted">Genres</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {genres.map((g, i) => (
          <div key={g.genre} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length],
              }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-foreground truncate max-w-[100px]">
              {g.genre}
            </span>
            <span className="text-[10px] text-muted ml-auto">
              {g.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
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

      {/* Pie Chart */}
      <div className="rounded-xl glass-subtle p-6">
        <GenrePieChart genres={genres} />
      </div>

      {/* Genre cards */}
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
