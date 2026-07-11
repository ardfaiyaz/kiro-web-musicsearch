"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Sparkles, Music, Disc3, Users } from "lucide-react";
import { useFavorites } from "@/app/components/FavoritesContext";
import { usePersonalization } from "@/app/components/PersonalizationContext";
import type { Collection, CollectionItem } from "@/lib/collections";

interface SmartCollectionsProps {
  onOpenVirtual: (collection: Collection) => void;
}

function subscribeNoop() {
  return () => {};
}

function getClientTimestamp() {
  return Date.now();
}

function getServerTimestamp() {
  return 0;
}

export default function SmartCollections({
  onOpenVirtual,
}: SmartCollectionsProps) {
  const { favorites, favoriteArtists, favoriteAlbums } = useFavorites();
  const { listeningHistory } = usePersonalization();
  const timestamp = useSyncExternalStore(subscribeNoop, getClientTimestamp, getServerTimestamp);

  const smartCollections = useMemo(() => {
    const collections: Collection[] = [];

    // Recently Added - last 20 favorites
    if (favorites.length > 0) {
      const recentFavs = favorites.slice(-20).reverse();
      const items: CollectionItem[] = recentFavs.map((t) => ({
        type: "track" as const,
        id: t.trackId,
        name: t.trackName,
        subtitle: t.artistName,
        artworkUrl: t.artworkUrl100,
      }));
      collections.push({
        id: "smart-recently-added",
        name: "Recently Added",
        description: "Your latest favorite songs",
        items,
        createdAt: timestamp,
        updatedAt: timestamp,
        coverStyle: "grid2x2",
      });
    }

    // Top Played (from history)
    if (listeningHistory.length > 0) {
      const trackCounts: Record<string, { count: number; entry: typeof listeningHistory[0] }> = {};
      for (const entry of listeningHistory) {
        const key = `${entry.trackId}`;
        if (!trackCounts[key]) {
          trackCounts[key] = { count: 0, entry };
        }
        trackCounts[key].count++;
      }
      const topItems = Object.values(trackCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map((t) => ({
          type: "track" as const,
          id: t.entry.trackId,
          name: t.entry.trackName,
          subtitle: t.entry.artistName,
          artworkUrl: t.entry.artworkUrl,
        }));
      if (topItems.length > 0) {
        collections.push({
          id: "smart-top-played",
          name: "Top Played",
          description: "Your most listened tracks",
          items: topItems,
          createdAt: timestamp,
          updatedAt: timestamp,
          coverStyle: "grid3x3",
        });
      }
    }

    // Hidden Gems (unique genre items - artists with uncommon genres)
    if (favoriteArtists.length > 3) {
      const genreCounts: Record<string, number> = {};
      for (const a of favoriteArtists) {
        const genre = a.primaryGenreName || "Unknown";
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
      const rareArtists = favoriteArtists
        .filter((a) => (genreCounts[a.primaryGenreName || "Unknown"] || 0) <= 1)
        .slice(0, 10);
      if (rareArtists.length > 0) {
        const items: CollectionItem[] = rareArtists.map((a) => ({
          type: "artist" as const,
          id: a.artistId,
          name: a.artistName,
          subtitle: a.primaryGenreName || "Music",
          artworkUrl: undefined,
        }));
        collections.push({
          id: "smart-hidden-gems",
          name: "Hidden Gems",
          description: "Artists with unique genres in your library",
          items,
          createdAt: timestamp,
          updatedAt: timestamp,
          coverStyle: "gradient",
        });
      }
    }

    // Favorite Albums collection
    if (favoriteAlbums.length > 0) {
      const items: CollectionItem[] = favoriteAlbums.slice(0, 20).map((a) => ({
        type: "album" as const,
        id: a.collectionId,
        name: a.collectionName,
        subtitle: a.artistName,
        artworkUrl: a.artworkUrl100,
      }));
      collections.push({
        id: "smart-favorite-albums",
        name: "Favorite Albums",
        description: "Albums you have saved",
        items,
        createdAt: timestamp,
        updatedAt: timestamp,
        coverStyle: "grid2x2",
      });
    }

    return collections;
  }, [favorites, favoriteArtists, favoriteAlbums, listeningHistory, timestamp]);

  if (smartCollections.length === 0) return null;

  return (
    <section aria-label="Smart collections">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">
          Smart Collections
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {smartCollections.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => onOpenVirtual(sc)}
            className="group flex flex-col items-start gap-2 rounded-2xl glass-light p-4 text-left transition-premium hover-glow hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-accent/50"
            aria-label={`Open smart collection: ${sc.name}`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground">
                {sc.name}
              </span>
            </div>
            <p className="line-clamp-1 text-xs text-muted">{sc.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted">
              {sc.items.filter((i) => i.type === "track").length > 0 && (
                <span className="flex items-center gap-1">
                  <Music className="h-3 w-3" aria-hidden="true" />
                  {sc.items.filter((i) => i.type === "track").length}
                </span>
              )}
              {sc.items.filter((i) => i.type === "album").length > 0 && (
                <span className="flex items-center gap-1">
                  <Disc3 className="h-3 w-3" aria-hidden="true" />
                  {sc.items.filter((i) => i.type === "album").length}
                </span>
              )}
              {sc.items.filter((i) => i.type === "artist").length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {sc.items.filter((i) => i.type === "artist").length}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
