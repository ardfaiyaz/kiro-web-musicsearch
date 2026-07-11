"use client";

import { useState } from "react";
import Image from "next/image";
import { Music } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface AlbumShelfProps {
  albums: ItunesAlbum[];
  onClick: (album: ItunesAlbum) => void;
}

function ShelfRow({ albums, onClick }: { albums: ItunesAlbum[]; onClick: (album: ItunesAlbum) => void }) {
  return (
    <div className="relative rounded-2xl glass-medium p-4">
      {/* Shelf background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 rounded-b-2xl bg-foreground/5" aria-hidden="true" />
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {albums.map((album) => (
          <ShelfAlbum key={album.collectionId} album={album} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}

function ShelfAlbum({ album, onClick }: { album: ItunesAlbum; onClick: (album: ItunesAlbum) => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const artworkUrl = album.artworkUrl100?.replace("100x100", "300x300");

  return (
    <button
      type="button"
      onClick={() => onClick(album)}
      className="group flex shrink-0 flex-col items-center gap-2 focus-visible:ring-2 focus-visible:ring-accent/50 rounded-xl"
      aria-label={`View ${album.collectionName} by ${album.artistName}`}
      style={{ perspective: "600px" }}
    >
      <div
        className="relative h-32 w-32 overflow-hidden rounded-lg shadow-md transition-all duration-[180ms] ease-out group-hover:scale-110 group-hover:shadow-xl sm:h-36 sm:w-36"
        style={{ transform: "rotateY(-3deg)" }}
      >
        {artworkUrl && !imageFailed ? (
          <Image
            src={artworkUrl}
            alt={`${album.collectionName} artwork`}
            fill
            sizes="144px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
            <Music className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="w-32 text-center sm:w-36">
        <p className="line-clamp-1 text-xs font-semibold text-foreground">
          {album.collectionName}
        </p>
        <p className="line-clamp-1 text-[10px] text-muted">
          {album.artistName}
        </p>
      </div>
    </button>
  );
}

export default function AlbumShelf({ albums, onClick }: AlbumShelfProps) {
  // Break albums into rows of 6
  const rows: ItunesAlbum[][] = [];
  for (let i = 0; i < albums.length; i += 6) {
    rows.push(albums.slice(i, i + 6));
  }

  return (
    <section aria-label="Album shelf view" className="space-y-4">
      {rows.map((row, idx) => (
        <ShelfRow key={idx} albums={row} onClick={onClick} />
      ))}
    </section>
  );
}
