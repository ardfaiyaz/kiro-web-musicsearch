"use client";

import Link from "next/link";
import { Sparkles, Disc3 } from "lucide-react";
import { useFavorites } from "@/app/components/FavoritesContext";

interface AlbumRecommendationsProps {
  genre?: string;
  currentAlbumId?: number;
}

export default function AlbumRecommendations({
  genre,
  currentAlbumId,
}: AlbumRecommendationsProps) {
  const { favoriteAlbums } = useFavorites();

  // Build genre-based recommendations from favorites
  const genreCounts: Record<string, number> = {};
  favoriteAlbums.forEach((a) => {
    if (a.primaryGenreName) {
      genreCounts[a.primaryGenreName] = (genreCounts[a.primaryGenreName] || 0) + 1;
    }
  });

  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([g]) => g);

  // If called from the drawer with a specific genre, prioritize that
  const displayGenres = genre
    ? [genre, ...topGenres.filter((g) => g !== genre)].slice(0, 3)
    : topGenres;

  if (displayGenres.length === 0 && !currentAlbumId) return null;

  return (
    <section aria-label="Album recommendations" className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-foreground">
          {currentAlbumId ? "Similar Albums" : "Discover More Albums"}
        </h4>
      </div>
      {displayGenres.length > 0 && (
        <>
          <p className="text-xs text-muted">
            {currentAlbumId
              ? `Based on ${genre || "your favorites"}, explore more in these genres.`
              : `Based on your love for ${topGenres.join(", ")}, discover more albums.`}
          </p>
          <div className="flex flex-wrap gap-3">
            {displayGenres.map((g) => (
              <Link
                key={g}
                href={`/?q=${encodeURIComponent(g)}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Disc3 className="h-4 w-4" aria-hidden="true" />
                Explore {g}
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
