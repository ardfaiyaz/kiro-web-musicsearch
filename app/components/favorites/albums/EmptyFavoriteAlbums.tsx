"use client";

import Link from "next/link";
import { Disc3, TrendingUp, Sparkles } from "lucide-react";

export default function EmptyFavoriteAlbums() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-8 py-20 text-center"
      aria-label="No favorite albums"
    >
      {/* Illustration */}
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full glass-subtle">
        <Disc3 className="h-14 w-14 text-muted" aria-hidden="true" />
        <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">
          No favorite albums yet
        </h3>
        <p className="max-w-md text-muted">
          Discover albums you love and add them to your collection.
          Your personal record gallery will appear here.
        </p>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-3" aria-label="Discover albums">
        <Link
          href="/?q=albums"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
        >
          <Disc3 className="h-4 w-4" aria-hidden="true" />
          Browse Albums
        </Link>
        <Link
          href="/?q=trending+albums"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl glass-medium px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Trending Albums
        </Link>
        <Link
          href="/?q=hidden+gems+album"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl glass-medium px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Hidden Gems
        </Link>
      </nav>
    </section>
  );
}
