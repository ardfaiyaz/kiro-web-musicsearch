"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import type { SpotifyTrack } from "@/lib/types";

interface TopTracksSectionProps {
  tracks: SpotifyTrack[];
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TopTracksSection({ tracks }: TopTracksSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayTracks = showAll ? tracks : tracks.slice(0, 5);

  if (tracks.length === 0) {
    return null;
  }

  return (
    <section id="top-songs" className="animate-on-scroll-slide-up" aria-label="Top songs">
      <h2 className="mb-6 text-2xl font-bold text-foreground tracking-tight">
        Top Songs
      </h2>

      <div className="flex flex-col gap-1">
        {displayTracks.map((track, index) => (
          <div
            key={track.id}
            className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-premium hover-glow hover:bg-surface"
            role="row"
            aria-label={`${index + 1}. ${track.name} from ${track.albumName}`}
          >
            {/* Rank number */}
            <span className="w-6 shrink-0 text-center text-sm font-bold text-muted group-hover:text-foreground">
              {index + 1}
            </span>

            {/* Album artwork */}
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-border">
              {track.albumImages?.[0]?.url ? (
                <Image
                  src={track.albumImages[0].url}
                  alt={`${track.albumName} artwork`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface">
                  <Play className="h-4 w-4 text-muted" aria-hidden="true" />
                </div>
              )}
              {/* Play overlay on hover */}
              {track.previewUrl && (
                <a
                  href={track.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Preview ${track.name}`}
                >
                  <Play className="h-5 w-5 text-white" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Track info */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {track.name}
                </span>
                {track.explicit && (
                  <span className="shrink-0 flex items-center gap-0.5 rounded bg-muted/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted" aria-label="Explicit content">
                    E
                  </span>
                )}
              </div>
              <span className="truncate text-xs text-muted">
                {track.albumName}
              </span>
            </div>

            {/* Popularity bar */}
            <div className="hidden w-24 items-center gap-2 sm:flex">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all"
                  style={{ width: `${track.popularity}%` }}
                  role="progressbar"
                  aria-valuenow={track.popularity}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Popularity: ${track.popularity}%`}
                />
              </div>
            </div>

            {/* Duration */}
            <span className="shrink-0 text-xs tabular-nums text-muted">
              {formatDuration(track.durationMs)}
            </span>
          </div>
        ))}
      </div>

      {/* Show more/less toggle */}
      {tracks.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted transition-premium hover:border-foreground/20 hover:text-foreground"
          aria-expanded={showAll}
          aria-label={showAll ? "Show fewer tracks" : "Show all tracks"}
        >
          {showAll ? (
            <>
              Show Less
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              Show All ({tracks.length})
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </section>
  );
}
