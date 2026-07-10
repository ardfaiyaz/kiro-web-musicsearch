"use client";

import Image from "next/image";
import Link from "next/link";
import { ItunesAlbum } from "@/lib/types";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AlbumCard({ album }: { album: ItunesAlbum }) {
  const artworkUrl = album.artworkUrl100?.replace("100x100", "200x200");

  return (
    <Link
      href={`/album/${album.collectionId}`}
      className="cursor-pointer group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-premium hover:border-foreground/10 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-border">
        {artworkUrl ? (
          <Image
            src={artworkUrl}
            alt={`${album.collectionName} album artwork`}
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
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="truncate text-sm font-bold text-foreground tracking-tight transition-premium group-hover:text-accent">
          {album.collectionName}
        </h3>
        <p className="truncate text-xs text-muted">{album.artistName}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-muted/70">
            {album.trackCount} {album.trackCount === 1 ? "track" : "tracks"}
          </span>
          {album.releaseDate && (
            <span className="text-xs text-muted/70">
              {formatDate(album.releaseDate)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
