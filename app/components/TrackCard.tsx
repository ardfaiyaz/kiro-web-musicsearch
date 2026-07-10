"use client";

import Image from "next/image";
import Link from "next/link";
import { ItunesTrack } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";
import { useFavorites } from "./FavoritesContext";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TrackCard({ track }: { track: ItunesTrack }) {
  const { isFavorite } = useFavorites();
  const favorited = isFavorite(track.trackId);
  const artworkUrl = track.artworkUrl100?.replace("100x100", "200x200");

  return (
    <Link
      href={`/track/${track.trackId}`}
      className="cursor-pointer group flex flex-col overflow-hidden rounded-2xl glass-card card-tilt hover-glow transition-premium hover:border-foreground/10 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-border">
        {artworkUrl ? (
          <Image
            src={artworkUrl}
            alt={`${track.trackName} album artwork`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-premium group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-12 w-12 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
          </div>
        )}
        <div
          className={`absolute top-2 right-2 transition-premium ${
            favorited ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <FavoriteButton track={track} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="truncate text-sm font-bold text-foreground tracking-tight group-hover:text-accent transition-premium">
          {track.trackName}
        </h3>
        <p className="truncate text-xs text-muted">{track.artistName}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="truncate text-xs text-muted/70">
            {track.collectionName}
          </p>
          {track.trackTimeMillis && (
            <span className="shrink-0 text-xs text-muted/70">
              {formatDuration(track.trackTimeMillis)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
