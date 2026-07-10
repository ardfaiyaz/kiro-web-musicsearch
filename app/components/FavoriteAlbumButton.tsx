"use client";

import { ItunesAlbum } from "@/lib/types";
import { usePersonalization } from "./PersonalizationContext";

export default function FavoriteAlbumButton({
  album,
}: {
  album: ItunesAlbum;
}) {
  const { addFavoriteAlbum, removeFavoriteAlbum, isAlbumFavorite } =
    usePersonalization();
  const favorited = isAlbumFavorite(album.collectionId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeFavoriteAlbum(album.collectionId);
    } else {
      addFavoriteAlbum(album);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        favorited ? "Remove album from favorites" : "Add album to favorites"
      }
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${
        favorited
          ? "bg-red-500/10 text-red-500 border border-red-500/30"
          : "bg-card border border-border text-muted hover:text-red-500 hover:border-red-500/30"
      }`}
    >
      <svg
        className="h-4 w-4"
        fill={favorited ? "currentColor" : "none"}
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
      {favorited ? "Favorited" : "Favorite"}
    </button>
  );
}
