"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid3X3, AlignJustify, Disc3 } from "lucide-react";
import type { SpotifyAlbum } from "@/lib/types";

interface DiscographySectionProps {
  albums: SpotifyAlbum[];
}

function getYear(dateStr: string): number {
  return new Date(dateStr).getFullYear();
}

export default function DiscographySection({ albums }: DiscographySectionProps) {
  const [view, setView] = useState<"grid" | "timeline">("grid");

  if (albums.length === 0) {
    return null;
  }

  const sortedByNewest = [...albums].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
  const sortedChronological = [...albums].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  return (
    <section id="discography" className="animate-on-scroll-slide-up" aria-label="Discography">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Discography
        </h2>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-full border border-border p-1">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-premium ${
              view === "grid"
                ? "bg-primary/10 text-primary"
                : "text-muted hover:text-foreground"
            }`}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <Grid3X3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-premium ${
              view === "timeline"
                ? "bg-primary/10 text-primary"
                : "text-muted hover:text-foreground"
            }`}
            aria-label="Timeline view"
            aria-pressed={view === "timeline"}
          >
            <AlignJustify className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedByNewest.map((album) => (
            <a
              key={album.id}
              href={album.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl glass-light card-tilt hover-glow transition-premium hover:border-foreground/10"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-border">
                {album.images?.[0]?.url ? (
                  <Image
                    src={album.images[0].url}
                    alt={`${album.name} album artwork`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-premium group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface">
                    <Disc3 className="h-10 w-10 text-muted" aria-hidden="true" />
                  </div>
                )}
                {/* Year badge */}
                <span className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-sm">
                  {getYear(album.releaseDate)}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3">
                <h3 className="truncate text-sm font-semibold text-foreground transition-premium group-hover:text-primary">
                  {album.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="capitalize">{album.albumType}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{album.totalTracks} tracks</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="relative flex items-end gap-6 pt-8" style={{ minWidth: "max-content" }}>
            {/* Timeline connector line */}
            <div
              className="timeline-connector absolute bottom-[72px] left-0 right-0 h-0.5 bg-border"
              aria-hidden="true"
            />

            {sortedChronological.map((album) => (
              <a
                key={album.id}
                href={album.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center gap-2"
              >
                {/* Year marker */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  {getYear(album.releaseDate)}
                </span>

                {/* Album node */}
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-border bg-surface shadow-md transition-premium group-hover:border-primary group-hover:scale-110 sm:h-24 sm:w-24">
                  {album.images?.[0]?.url ? (
                    <Image
                      src={album.images[0].url}
                      alt={`${album.name} artwork`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Disc3 className="h-6 w-6 text-muted" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Timeline dot */}
                <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" aria-hidden="true" />

                {/* Album title */}
                <span className="max-w-24 truncate text-center text-xs font-medium text-foreground transition-premium group-hover:text-primary">
                  {album.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
