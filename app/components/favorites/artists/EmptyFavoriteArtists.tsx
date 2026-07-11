"use client";

import Link from "next/link";
import { Users, TrendingUp, Music } from "lucide-react";

export default function EmptyFavoriteArtists() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-8 py-20 text-center"
      aria-label="No favorite artists"
    >
      {/* Illustration */}
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full glass-subtle">
        <Users className="h-14 w-14 text-muted" aria-hidden="true" />
        <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
          <Music className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">
          No favorite artists yet
        </h3>
        <p className="max-w-md text-muted">
          Discover artists you love and add them to your collection.
          Your personal artist gallery will appear here.
        </p>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-3" aria-label="Discover artists">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Discover Artists
        </Link>
        <Link
          href="/?q=trending+artists"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl glass-medium px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Trending Artists
        </Link>
        <Link
          href="/?q=genre"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl glass-medium px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          <Music className="h-4 w-4" aria-hidden="true" />
          Browse Genres
        </Link>
      </nav>
    </section>
  );
}
