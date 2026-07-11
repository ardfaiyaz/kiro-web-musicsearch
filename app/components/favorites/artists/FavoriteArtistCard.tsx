"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Heart, Share2 } from "lucide-react";
import type { ItunesArtist } from "@/lib/types";

interface FavoriteArtistCardProps {
  artist: ItunesArtist;
  onRemove: (artistId: number) => void;
  onShare: (artist: ItunesArtist) => void;
  onClick: (artist: ItunesArtist) => void;
}

export default function FavoriteArtistCard({
  artist,
  onRemove,
  onShare,
  onClick,
}: FavoriteArtistCardProps) {
  const artworkUrl = artist.artworkUrl100?.replace("100x100", "300x300");
  const [imageFailed, setImageFailed] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(artist);
    }
  }

  return (
    <article
      className="group relative flex flex-col items-center gap-3 rounded-2xl glass-medium p-4 transition-premium hover-glow card-tilt cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
      onClick={() => onClick(artist)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${artist.artistName}`}
    >
      {/* Portrait */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full shadow-md sm:h-28 sm:w-28">
        {artworkUrl && !imageFailed ? (
          <Image
            src={artworkUrl}
            alt={`${artist.artistName} portrait`}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-cover transition-transform duration-[180ms] ease-out group-hover:scale-110"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )}

        {/* Verified badge overlay */}
        <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-sm">
          <BadgeCheck className="h-3.5 w-3.5" aria-label="Verified artist" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground tracking-tight">
          {artist.artistName}
        </h3>
        <p className="text-xs text-muted">
          {artist.primaryGenreName || "Music"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(artist.artistId);
          }}
          aria-label={`Remove ${artist.artistName} from favorites`}
          className="flex h-8 w-8 items-center justify-center rounded-full glass-subtle text-red-500 transition-colors hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShare(artist);
          }}
          aria-label={`Share ${artist.artistName}`}
          className="flex h-8 w-8 items-center justify-center rounded-full glass-subtle text-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
