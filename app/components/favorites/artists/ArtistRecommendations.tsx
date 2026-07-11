"use client";

import Link from "next/link";
import { Sparkles, Users } from "lucide-react";
import type { ItunesArtist } from "@/lib/types";

interface ArtistRecommendationsProps {
  artists: ItunesArtist[];
}

export default function ArtistRecommendations({
  artists,
}: ArtistRecommendationsProps) {
  if (artists.length === 0) return null;

  // Build genre-based recommendations from favorites
  const genreCounts: Record<string, number> = {};
  artists.forEach((a) => {
    if (a.primaryGenreName) {
      genreCounts[a.primaryGenreName] = (genreCounts[a.primaryGenreName] || 0) + 1;
    }
  });

  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);

  if (topGenres.length === 0) return null;

  return (
    <section aria-label="Artist recommendations" className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="text-lg font-bold text-foreground">Discover More</h3>
      </div>
      <p className="text-sm text-muted">
        Based on your love for{" "}
        <strong className="text-foreground">{topGenres.join(", ")}</strong>, you
        might enjoy discovering more artists in these genres.
      </p>
      <div className="flex flex-wrap gap-3">
        {topGenres.map((genre) => (
          <Link
            key={genre}
            href={`/?term=${encodeURIComponent(genre)}&entity=musicArtist`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Explore {genre}
          </Link>
        ))}
      </div>
    </section>
  );
}
