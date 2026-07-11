"use client";

import Image from "next/image";
import { Heart, Users } from "lucide-react";
import { useFavorites } from "@/app/components/FavoritesContext";
import type { ItunesArtist } from "@/lib/types";

interface SimilarArtist {
  name: string;
  imageUrl?: string;
  genres: string[];
  reason: string;
}

interface SimilarArtistsPanelProps {
  artists: SimilarArtist[];
  sourceArtistName: string;
}

export default function SimilarArtistsPanel({
  artists,
  sourceArtistName,
}: SimilarArtistsPanelProps) {
  const { addFavoriteArtist, removeFavoriteArtist, favoriteArtists } =
    useFavorites();

  if (artists.length === 0) return null;

  function handleToggleFavorite(similarArtist: SimilarArtist) {
    const existing = favoriteArtists.find(
      (a) => a.artistName.toLowerCase() === similarArtist.name.toLowerCase()
    );
    if (existing) {
      removeFavoriteArtist(existing.artistId);
    } else {
      // Generate a deterministic ID from the artist name using a simple hash
      let hash = 0;
      for (let i = 0; i < similarArtist.name.length; i++) {
        const char = similarArtist.name.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const artistId = Math.abs(hash || 1);
      const newArtist: ItunesArtist = {
        artistId,
        artistName: similarArtist.name,
        artistLinkUrl: "",
        primaryGenreName: similarArtist.genres[0] || "",
        artistType: "Artist",
        wrapperType: "artist",
        artworkUrl100: similarArtist.imageUrl,
      };
      addFavoriteArtist(newArtist);
    }
  }

  function isAlreadyFavorite(name: string): boolean {
    return favoriteArtists.some(
      (a) => a.artistName.toLowerCase() === name.toLowerCase()
    );
  }

  return (
    <section aria-label="Similar artists" className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">
        Similar to {sourceArtistName}
      </h4>
      <div className="space-y-2" role="list">
        {artists.slice(0, 6).map((similar) => {
          const isFav = isAlreadyFavorite(similar.name);
          return (
            <div
              key={similar.name}
              role="listitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-foreground/5"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                {similar.imageUrl ? (
                  <Image
                    src={similar.imageUrl}
                    alt={`${similar.name} portrait`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">
                  {similar.name}
                </p>
                <p className="truncate text-xs text-muted">
                  {similar.reason}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleFavorite(similar)}
                aria-label={
                  isFav
                    ? `Remove ${similar.name} from favorites`
                    : `Add ${similar.name} to favorites`
                }
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  isFav
                    ? "text-red-500 hover:bg-red-500/10"
                    : "text-muted hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isFav ? "fill-current" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
