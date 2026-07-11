"use client";

import Link from "next/link";
import Image from "next/image";
import { Disc3, Clock, Search, SortDesc, Filter } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface FavoriteAlbumsHeroProps {
  albums: ItunesAlbum[];
  onSearchFocus: () => void;
  onToggleFilters: () => void;
  onToggleSort: () => void;
}

export default function FavoriteAlbumsHero({
  albums,
  onSearchFocus,
  onToggleFilters,
  onToggleSort,
}: FavoriteAlbumsHeroProps) {
  const genres = Array.from(
    new Set(albums.map((a) => a.primaryGenreName).filter(Boolean))
  );
  const topGenre = genres[0] || "Music";
  const recentAlbum = albums[albums.length - 1];

  // Take up to 9 albums for the mosaic
  const mosaicAlbums = albums.slice(0, 9);

  return (
    <section
      aria-label="Favorite albums hero"
      className="relative overflow-hidden rounded-3xl glass-ultra p-6 sm:p-8"
    >
      {/* Album wall mosaic background */}
      {mosaicAlbums.length > 0 && (
        <div
          className="pointer-events-none absolute inset-0 grid grid-cols-3 gap-0.5 opacity-15 blur-sm"
          aria-hidden="true"
        >
          {mosaicAlbums.map((album) => (
            <div key={album.collectionId} className="relative aspect-square overflow-hidden">
              <Image
                src={album.artworkUrl100.replace("100x100", "200x200")}
                alt=""
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Ambient gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `linear-gradient(135deg, var(--accent) 0%, transparent 50%, var(--accent) 100%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your Albums
            </h2>
            <p className="mt-1 text-sm text-muted">
              {albums.length} {albums.length === 1 ? "album" : "albums"} &middot;{" "}
              {genres.length} {genres.length === 1 ? "genre" : "genres"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="glass-light rounded-lg px-3 py-1.5">
              Top genre: <strong className="text-foreground">{topGenre}</strong>
            </span>
            {recentAlbum && (
              <span className="glass-light rounded-lg px-3 py-1.5">
                Recent: <strong className="text-foreground">{recentAlbum.collectionName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <nav className="flex flex-wrap gap-2" aria-label="Quick actions">
          <Link
            href="/?entity=album"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Disc3 className="h-4 w-4" aria-hidden="true" />
            Browse All
          </Link>
          <Link
            href="/?term=new+albums"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            Recently Added
          </Link>
          <button
            type="button"
            onClick={onSearchFocus}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <SortDesc className="h-4 w-4" aria-hidden="true" />
            Sort
          </button>
          <button
            type="button"
            onClick={onToggleFilters}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filter
          </button>
        </nav>
      </div>
    </section>
  );
}
