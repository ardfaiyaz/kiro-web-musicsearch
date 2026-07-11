"use client";

import Link from "next/link";
import type { ItunesAlbum, SpotifyAlbum } from "@/lib/types";

interface AlbumMetadataProps {
  album: ItunesAlbum;
  spotify?: SpotifyAlbum;
  trackCount: number;
  totalDuration: string;
}

export default function AlbumMetadata({
  album,
  spotify,
  trackCount,
  totalDuration,
}: AlbumMetadataProps) {
  const releaseYear = album.releaseDate
    ? new Date(album.releaseDate).getFullYear().toString()
    : null;

  const genres = [
    album.primaryGenreName,
    ...(spotify?.albumType ? [] : []),
  ].filter(Boolean);

  return (
    <div className="flex max-w-[700px] flex-col gap-4">
      {/* Album title */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[length:var(--font-size-display-sm)] lg:leading-tight">
        {album.collectionName}
      </h1>

      {/* Artist name */}
      <p className="text-xl text-muted sm:text-2xl">
        <Link
          href={`/artist/${album.artistId}`}
          className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          {album.artistName}
        </Link>
      </p>

      {/* Genre tags */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary"
            >
              {genre}
            </span>
          ))}
          {spotify?.albumType && (
            <span className="rounded-full bg-foreground/5 border border-border px-3 py-1 text-xs font-medium capitalize text-muted">
              {spotify.albumType}
            </span>
          )}
        </div>
      )}

      {/* Metadata line */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        {releaseYear && <span>{releaseYear}</span>}
        <span aria-hidden="true" className="hidden sm:inline">
          &middot;
        </span>
        <span>
          {trackCount} {trackCount === 1 ? "song" : "songs"}
        </span>
        <span aria-hidden="true" className="hidden sm:inline">
          &middot;
        </span>
        <span>{totalDuration}</span>
      </div>

      {/* Explicit badge */}
      {album.collectionExplicitness === "explicit" && (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded bg-foreground/10 text-[10px] font-bold uppercase text-foreground/70"
            title="Explicit content"
            aria-label="Explicit content"
          >
            E
          </span>
          <span className="text-xs text-muted">Explicit content</span>
        </div>
      )}
    </div>
  );
}
