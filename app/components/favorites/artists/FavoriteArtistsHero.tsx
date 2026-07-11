"use client";

import Link from "next/link";
import { Users, Compass, Search, SortDesc, Filter } from "lucide-react";
import type { ItunesArtist } from "@/lib/types";

interface FavoriteArtistsHeroProps {
  artists: ItunesArtist[];
  onSearchFocus: () => void;
  onToggleFilters: () => void;
  onToggleSort: () => void;
}

export default function FavoriteArtistsHero({
  artists,
  onSearchFocus,
  onToggleFilters,
  onToggleSort,
}: FavoriteArtistsHeroProps) {
  const genres = Array.from(
    new Set(artists.map((a) => a.primaryGenreName).filter(Boolean))
  );
  const topArtist = artists[0];
  const recentArtist = artists[artists.length - 1];

  return (
    <section
      aria-label="Favorite artists hero"
      className="relative overflow-hidden rounded-3xl glass-ultra p-6 sm:p-8"
    >
      {/* Ambient background gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
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
              Your Artists
            </h2>
            <p className="mt-1 text-sm text-muted">
              {artists.length} {artists.length === 1 ? "artist" : "artists"} &middot;{" "}
              {genres.length} {genres.length === 1 ? "genre" : "genres"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            {topArtist && (
              <span className="glass-light rounded-lg px-3 py-1.5">
                Top: <strong className="text-foreground">{topArtist.artistName}</strong>
              </span>
            )}
            {recentArtist && recentArtist !== topArtist && (
              <span className="glass-light rounded-lg px-3 py-1.5">
                Recent: <strong className="text-foreground">{recentArtist.artistName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <nav className="flex flex-wrap gap-2" aria-label="Quick actions">
          <Link
            href="/?q=artists"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Browse All
          </Link>
          <Link
            href="/?q=similar+artists"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            Discover Similar
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
