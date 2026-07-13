"use client";

import { useState, useCallback } from "react";
import { ItunesTrack } from "@/lib/types";
import { useFavorites } from "./FavoritesContext";
import ParticleEffect, { useParticleBurst } from "./ui/ParticleEffect";

export default function FavoriteButton({ track }: { track: ItunesTrack }) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(track.trackId);
  const [isBursting, setIsBursting] = useState(false);
  const { bursts, triggerBurst } = useParticleBurst();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (favorited) {
        removeFavorite(track.trackId);
      } else {
        addFavorite(track);
        setIsBursting(true);
        setTimeout(() => setIsBursting(false), 600);
        // Trigger particle burst at click position
        triggerBurst(e.clientX, e.clientY);
      }
    },
    [favorited, track, addFavorite, removeFavorite, triggerBurst]
  );

  return (
    <>
      <ParticleEffect bursts={bursts} />
      <button
        type="button"
        onClick={handleClick}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className={`cursor-pointer relative flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:scale-110 ${
          favorited ? "text-red-500" : "text-muted hover:text-red-500"
        } ${isBursting ? "heart-burst" : ""}`}
      >
        {favorited ? (
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 8.25c0-3.15-2.7-5.25-5.437-5.25A5.5 5.5 0 0012 5.052 5.5 5.5 0 007.688 3C4.95 3 2.25 5.1 2.25 8.25c0 7.22 9.75 12.75 9.75 12.75s9.75-5.53 9.75-12.75z"
            />
          </svg>
        )}
      </button>
    </>
  );
}
