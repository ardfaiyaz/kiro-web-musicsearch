"use client";

import { useMemo } from "react";
import { Radar } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface TasteCompatibilityProps {
  history: HistoryEntry[];
}

// Global average genre distribution (hardcoded typical distribution)
const GLOBAL_AVERAGES: Record<string, number> = {
  Pop: 25,
  "Hip-Hop/Rap": 18,
  Rock: 15,
  "R&B/Soul": 10,
  Electronic: 8,
  Country: 7,
  Latin: 6,
  Alternative: 5,
  "Singer/Songwriter": 3,
  Classical: 3,
};

const GENRE_COLORS = [
  "from-blue-400 to-blue-500",
  "from-purple-400 to-purple-500",
  "from-pink-400 to-pink-500",
  "from-red-400 to-red-500",
  "from-orange-400 to-orange-500",
  "from-yellow-400 to-yellow-500",
  "from-green-400 to-green-500",
  "from-teal-400 to-teal-500",
  "from-cyan-400 to-cyan-500",
  "from-indigo-400 to-indigo-500",
];

interface GenreComparison {
  genre: string;
  userPercent: number;
  globalPercent: number;
  colorClass: string;
}

export default function TasteCompatibility({
  history,
}: TasteCompatibilityProps) {
  const { score, comparisons } = useMemo(() => {
    if (history.length === 0) return { score: 0, comparisons: [] };

    // Calculate user genre distribution
    const genreCount = new Map<string, number>();
    for (const entry of history) {
      const genre = entry.primaryGenreName || "Unknown";
      genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
    }

    const total = history.length;
    const userDistribution = new Map<string, number>();
    for (const [genre, count] of genreCount) {
      userDistribution.set(genre, Math.round((count / total) * 100));
    }

    // Calculate compatibility score (lower difference = higher compatibility)
    let totalDifference = 0;
    let genresCompared = 0;
    const allGenres = new Set([
      ...Object.keys(GLOBAL_AVERAGES),
      ...userDistribution.keys(),
    ]);

    for (const genre of allGenres) {
      const userPct = userDistribution.get(genre) || 0;
      const globalPct = GLOBAL_AVERAGES[genre] || 0;
      totalDifference += Math.abs(userPct - globalPct);
      genresCompared++;
    }

    // Normalize score (0-100, higher = more similar to global)
    const maxPossibleDiff = genresCompared * 100;
    const compatibilityScore =
      maxPossibleDiff > 0
        ? Math.round(
            100 - (totalDifference / maxPossibleDiff) * 100
          )
        : 50;

    // Build comparisons for display
    const genreComparisons: GenreComparison[] = Object.entries(GLOBAL_AVERAGES)
      .map(([genre, globalPct], index) => ({
        genre,
        userPercent: userDistribution.get(genre) || 0,
        globalPercent: globalPct,
        colorClass: GENRE_COLORS[index % GENRE_COLORS.length],
      }))
      .slice(0, 8);

    return { score: compatibilityScore, comparisons: genreComparisons };
  }, [history]);

  if (history.length === 0) return null;

  return (
    <section aria-label="Taste compatibility" className="space-y-4">
      <div className="flex items-center gap-2">
        <Radar className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Taste Compatibility
        </h3>
      </div>

      <div className="rounded-xl glass-subtle p-6">
        {/* Score display */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative h-28 w-28">
            {/* Background circle */}
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full -rotate-90"
              role="img"
              aria-label={`Taste compatibility score: ${score}%`}
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-foreground/10"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className="text-blue-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {score}%
              </span>
              <span className="text-[10px] text-muted">Match</span>
            </div>
          </div>
          <p className="text-xs text-muted mt-2">
            How your taste compares to global listening trends
          </p>
        </div>

        {/* Radar/comparison chart - CSS bars */}
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-[10px] text-muted mb-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Your Taste
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-foreground/30" />
              Global Average
            </span>
          </div>

          {comparisons.map((item) => (
            <div key={item.genre} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-foreground font-medium">
                  {item.genre}
                </span>
                <span className="text-muted">
                  {item.userPercent}% vs {item.globalPercent}%
                </span>
              </div>
              <div className="relative h-4 rounded-full bg-foreground/5 overflow-hidden">
                {/* Global average marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-10"
                  style={{ left: `${Math.min(item.globalPercent, 100)}%` }}
                />
                {/* User bar */}
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.colorClass} opacity-70 transition-all duration-700`}
                  style={{
                    width: `${Math.min(item.userPercent, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
