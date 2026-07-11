"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import Link from "next/link";

interface HistoryRecommendationsProps {
  history: HistoryEntry[];
}

interface Recommendation {
  type: "genre" | "artist";
  label: string;
  reason: string;
  searchQuery: string;
}

export default function HistoryRecommendations({ history }: HistoryRecommendationsProps) {
  const recommendations = useMemo((): Recommendation[] => {
    if (history.length < 3) return [];
    const result: Recommendation[] = [];

    // Find top genres
    const genreCount = new Map<string, number>();
    for (const entry of history) {
      if (entry.primaryGenreName) {
        genreCount.set(
          entry.primaryGenreName,
          (genreCount.get(entry.primaryGenreName) || 0) + 1
        );
      }
    }

    const sortedGenres = [...genreCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [genre] of sortedGenres) {
      result.push({
        type: "genre",
        label: `Discover more ${genre}`,
        reason: `Because you listened to ${genre}`,
        searchQuery: genre,
      });
    }

    // Find top artists to recommend similar
    const artistCount = new Map<string, number>();
    for (const entry of history) {
      artistCount.set(entry.artistName, (artistCount.get(entry.artistName) || 0) + 1);
    }

    const sortedArtists = [...artistCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    for (const [artist] of sortedArtists) {
      result.push({
        type: "artist",
        label: `More from ${artist}`,
        reason: `Because you enjoy ${artist}`,
        searchQuery: artist,
      });
    }

    return result.slice(0, 5);
  }, [history]);

  if (recommendations.length === 0) return null;

  return (
    <section aria-label="Recommendations based on history" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-muted" aria-hidden="true" />
        Recommendations
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <Link
            key={`${rec.type}-${rec.label}`}
            href={`/?q=${encodeURIComponent(rec.searchQuery)}`}
            className="flex flex-col rounded-xl glass-light p-4 transition-premium hover:shadow-lg hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          >
            <span className="text-sm font-medium text-foreground">
              {rec.label}
            </span>
            <span className="mt-1 text-xs text-muted">{rec.reason}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
