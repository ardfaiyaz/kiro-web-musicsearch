"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Share2, Music } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface AlbumCompactProps {
  albums: ItunesAlbum[];
  onRemove: (collectionId: number) => void;
  onShare: (album: ItunesAlbum) => void;
  onClick: (album: ItunesAlbum) => void;
}

function CompactAlbumItem({
  album,
  onRemove,
  onShare,
  onClick,
}: {
  album: ItunesAlbum;
  onRemove: (collectionId: number) => void;
  onShare: (album: ItunesAlbum) => void;
  onClick: (album: ItunesAlbum) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const artworkUrl = album.artworkUrl100?.replace("100x100", "200x200");
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;

  return (
    <article
      className="group flex items-center gap-3 rounded-xl glass-subtle p-2 transition-premium cursor-pointer hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
      onClick={() => onClick(album)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(album);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${album.collectionName} by ${album.artistName}`}
    >
      {/* Small artwork */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        {artworkUrl && !imageFailed ? (
          <Image
            src={artworkUrl}
            alt={`${album.collectionName} artwork`}
            fill
            sizes="64px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
            <Music className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
          {album.collectionName}
        </h3>
        <p className="line-clamp-1 text-xs text-muted">{album.artistName}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted">
          {releaseYear && !isNaN(releaseYear) && <span>{releaseYear}</span>}
          {album.primaryGenreName && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{album.primaryGenreName}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(album.collectionId);
          }}
          aria-label={`Remove ${album.collectionName} from favorites`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShare(album);
          }}
          aria-label={`Share ${album.collectionName}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default function AlbumCompact({
  albums,
  onRemove,
  onShare,
  onClick,
}: AlbumCompactProps) {
  return (
    <section aria-label="Album compact view">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {albums.map((album) => (
          <CompactAlbumItem
            key={album.collectionId}
            album={album}
            onRemove={onRemove}
            onShare={onShare}
            onClick={onClick}
          />
        ))}
      </div>
    </section>
  );
}
