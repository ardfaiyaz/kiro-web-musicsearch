"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Share2, Music } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface FavoriteAlbumCardProps {
  album: ItunesAlbum;
  onRemove: (collectionId: number) => void;
  onShare: (album: ItunesAlbum) => void;
  onClick: (album: ItunesAlbum) => void;
}

export default function FavoriteAlbumCard({
  album,
  onRemove,
  onShare,
  onClick,
}: FavoriteAlbumCardProps) {
  const artworkUrl = album.artworkUrl100?.replace("100x100", "600x600");
  const [imageFailed, setImageFailed] = useState(false);
  const releaseYear = album.releaseDate
    ? new Date(album.releaseDate).getFullYear()
    : null;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(album);
    }
  }

  return (
    <article
      className="group relative flex flex-col gap-3 rounded-2xl glass-light p-3 transition-premium hover-glow card-tilt cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
      onClick={() => onClick(album)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${album.collectionName} by ${album.artistName}`}
    >
      {/* Artwork */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-md">
        {artworkUrl && !imageFailed ? (
          <Image
            src={artworkUrl}
            alt={`${album.collectionName} album artwork`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-[180ms] ease-out group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
            <Music className="h-12 w-12" aria-hidden="true" />
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="flex items-center gap-2 p-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(album.collectionId);
              }}
              aria-label={`Remove ${album.collectionName} from favorites`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-red-400 transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(album);
              }}
              aria-label={`Share ${album.collectionName}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground tracking-tight">
          {album.collectionName}
        </h3>
        <p className="line-clamp-1 text-xs text-muted">
          {album.artistName}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-muted">
          {releaseYear && !isNaN(releaseYear) && <span>{releaseYear}</span>}
          {album.primaryGenreName && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{album.primaryGenreName}</span>
            </>
          )}
          {album.trackCount > 0 && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{album.trackCount} tracks</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
