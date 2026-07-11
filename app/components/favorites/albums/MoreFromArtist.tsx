"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface MoreFromArtistProps {
  albums: ItunesAlbum[];
  artistName: string;
}

function AlbumThumb({ album }: { album: ItunesAlbum }) {
  const [imageFailed, setImageFailed] = useState(false);
  const artworkUrl = album.artworkUrl100?.replace("100x100", "300x300");
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;

  return (
    <Link
      href={`/album/${album.collectionId}`}
      className="group flex shrink-0 flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-lg shadow-sm sm:h-28 sm:w-28">
        {artworkUrl && !imageFailed ? (
          <Image
            src={artworkUrl}
            alt={`${album.collectionName} artwork`}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-[180ms] group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
            <Music className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="w-24 text-center sm:w-28">
        <p className="line-clamp-1 text-xs font-medium text-foreground">
          {album.collectionName}
        </p>
        <p className="text-[10px] text-muted">
          {releaseYear && !isNaN(releaseYear) ? releaseYear : ""}
        </p>
      </div>
    </Link>
  );
}

export default function MoreFromArtist({ albums, artistName }: MoreFromArtistProps) {
  if (albums.length === 0) return null;

  return (
    <section aria-label={`More from ${artistName}`} className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">
        More from {artistName}
      </h4>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {albums.map((album) => (
          <AlbumThumb key={album.collectionId} album={album} />
        ))}
      </div>
    </section>
  );
}
