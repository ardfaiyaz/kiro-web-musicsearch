"use client";

import { useRef, useEffect } from "react";
import { FolderPlus, Search, Music, Disc3, Users } from "lucide-react";
import type { Collection } from "@/lib/collections";

interface CollectionHeroProps {
  collections: Collection[];
  onCreateClick: () => void;
  onSearchFocus: () => void;
}

function AnimatedCounter({
  target,
  label,
  icon,
}: {
  target: number;
  label: string;
  icon: React.ReactNode;
}) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (animatedRef.current || !displayRef.current) return;
    animatedRef.current = true;
    const el = displayRef.current;
    const startTime = performance.now();
    const duration = 700;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [target]);

  return (
    <div className="flex items-center gap-3 rounded-xl glass-light px-4 py-3">
      <span className="text-accent" aria-hidden="true">
        {icon}
      </span>
      <div>
        <span ref={displayRef} className="text-lg font-bold text-foreground">
          0
        </span>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function CollectionHero({
  collections,
  onCreateClick,
  onSearchFocus,
}: CollectionHeroProps) {
  const totalSongs = collections.reduce(
    (sum, c) => sum + c.items.filter((i) => i.type === "track").length,
    0
  );
  const totalAlbums = collections.reduce(
    (sum, c) => sum + c.items.filter((i) => i.type === "album").length,
    0
  );
  const totalArtists = collections.reduce(
    (sum, c) => sum + c.items.filter((i) => i.type === "artist").length,
    0
  );

  const recentlyUpdated = collections.length > 0
    ? [...collections].sort(
        (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
      )[0]
    : null;

  // Collect artwork for mosaic background
  const artworks = collections
    .flatMap((c) => c.items)
    .filter((i) => i.artworkUrl)
    .slice(0, 6)
    .map((i) => i.artworkUrl as string);

  return (
    <section
      aria-label="Collections hero"
      className="relative overflow-hidden rounded-3xl glass-ultra p-6 sm:p-8"
    >
      {/* Artwork mosaic background */}
      {artworks.length > 0 && (
        <div
          className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-2 opacity-15"
          aria-hidden="true"
        >
          {artworks.map((url, i) => (
            <div
              key={i}
              className="relative overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover blur-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, transparent 50%, var(--accent) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your Collections
            </h2>
            <p className="mt-1 text-sm text-muted">
              {collections.length}{" "}
              {collections.length === 1 ? "collection" : "collections"}
              {recentlyUpdated && (
                <span>
                  {" "}
                  &middot; Recently updated:{" "}
                  <strong className="text-foreground">
                    {recentlyUpdated.name}
                  </strong>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AnimatedCounter
            target={collections.length}
            label="Collections"
            icon={<FolderPlus className="h-4 w-4" />}
          />
          <AnimatedCounter
            target={totalSongs}
            label="Songs"
            icon={<Music className="h-4 w-4" />}
          />
          <AnimatedCounter
            target={totalAlbums}
            label="Albums"
            icon={<Disc3 className="h-4 w-4" />}
          />
          <AnimatedCounter
            target={totalArtists}
            label="Artists"
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        {/* Quick Actions */}
        <nav className="flex flex-wrap gap-2" aria-label="Quick actions">
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-premium hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <FolderPlus className="h-4 w-4" aria-hidden="true" />
            Create Collection
          </button>
          <button
            type="button"
            onClick={onSearchFocus}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-premium hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
        </nav>
      </div>
    </section>
  );
}
