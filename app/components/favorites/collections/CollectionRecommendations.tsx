"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Sparkles, Plus } from "lucide-react";
import { useFavorites } from "@/app/components/FavoritesContext";
import type { Collection, CollectionItem } from "@/lib/collections";

interface CollectionRecommendationsProps {
  collections: Collection[];
  onAddToCollection: (item: CollectionItem, collectionId: string) => void;
}

interface Recommendation {
  item: CollectionItem;
  reason: string;
  targetCollectionId: string;
}

export default function CollectionRecommendations({
  collections,
  onAddToCollection,
}: CollectionRecommendationsProps) {
  const { favorites } = useFavorites();

  const recommendations = useMemo((): Recommendation[] => {
    if (collections.length === 0 || favorites.length === 0) return [];

    // Get genres from collections
    const collectionGenres: Record<string, string[]> = {};
    for (const c of collections) {
      const genres = Array.from(
        new Set(c.items.map((i) => i.subtitle).filter(Boolean))
      );
      collectionGenres[c.id] = genres;
    }

    // Find favorites not in any collection
    const allItemIds = new Set(
      collections.flatMap((c) => c.items.map((i) => `${i.type}-${i.id}`))
    );

    const suggestions: Recommendation[] = [];

    for (const track of favorites) {
      if (allItemIds.has(`track-${track.trackId}`)) continue;
      // Find a matching collection by genre
      for (const c of collections) {
        const genres = collectionGenres[c.id] || [];
        if (
          genres.some(
            (g) =>
              track.primaryGenreName
                ?.toLowerCase()
                .includes(g.toLowerCase()) ||
              g.toLowerCase().includes(
                track.primaryGenreName?.toLowerCase() || ""
              )
          )
        ) {
          suggestions.push({
            item: {
              type: "track",
              id: track.trackId,
              name: track.trackName,
              subtitle: track.artistName,
              artworkUrl: track.artworkUrl100,
            },
            reason: `Matches your "${c.name}" collection`,
            targetCollectionId: c.id,
          });
          break;
        }
      }
      if (suggestions.length >= 6) break;
    }

    // If we still need more, just suggest random uncollected favorites
    if (suggestions.length < 6 && collections.length > 0) {
      const firstCollection = collections[0];
      for (const track of favorites) {
        if (suggestions.length >= 6) break;
        if (allItemIds.has(`track-${track.trackId}`)) continue;
        if (suggestions.some((s) => s.item.id === track.trackId)) continue;
        suggestions.push({
          item: {
            type: "track",
            id: track.trackId,
            name: track.trackName,
            subtitle: track.artistName,
            artworkUrl: track.artworkUrl100,
          },
          reason: `Add to "${firstCollection.name}"`,
          targetCollectionId: firstCollection.id,
        });
      }
    }

    return suggestions.slice(0, 6);
  }, [collections, favorites]);

  if (recommendations.length === 0) return null;

  return (
    <section aria-label="Collection recommendations">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">
          Suggested for Your Collections
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <div
            key={`${rec.item.type}-${rec.item.id}`}
            className="flex items-center gap-3 rounded-xl glass-subtle p-3"
          >
            {/* Artwork */}
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-foreground/10">
              {rec.item.artworkUrl ? (
                <Image
                  src={rec.item.artworkUrl}
                  alt={rec.item.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
            </div>
            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {rec.item.name}
              </p>
              <p className="truncate text-[10px] text-muted">{rec.reason}</p>
            </div>
            {/* Add button */}
            <button
              type="button"
              onClick={() =>
                onAddToCollection(rec.item, rec.targetCollectionId)
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent/50"
              aria-label={`Add ${rec.item.name} to collection`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
