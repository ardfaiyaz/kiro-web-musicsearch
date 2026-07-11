"use client";

import Image from "next/image";
import { Play, Music } from "lucide-react";
import type { SpotifyTrack } from "@/lib/types";

interface TopSongsPreviewProps {
  tracks: SpotifyTrack[];
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TopSongsPreview({ tracks }: TopSongsPreviewProps) {
  if (tracks.length === 0) return null;

  const displayTracks = tracks.slice(0, 10);

  return (
    <section aria-label="Top songs" className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Top Songs</h4>
      <ol className="space-y-1" aria-label="Top songs list">
        {displayTracks.map((track, index) => (
          <li key={track.id}>
            <div className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-foreground/5">
              <span className="w-5 text-xs text-muted text-right">{index + 1}</span>
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                {track.albumImages[0]?.url ? (
                  <Image
                    src={track.albumImages[0].url}
                    alt={`${track.albumName} artwork`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
                    <Music className="h-4 w-4" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">
                  {track.name}
                </p>
                <p className="truncate text-xs text-muted">{track.albumName}</p>
              </div>
              <span className="hidden text-xs text-muted sm:block">
                {formatDuration(track.durationMs)}
              </span>
              {/* Popularity indicator */}
              <div
                className="hidden h-1 w-12 overflow-hidden rounded-full bg-foreground/10 sm:block"
                aria-label={`Popularity: ${track.popularity}%`}
                title={`Popularity: ${track.popularity}%`}
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
              {track.previewUrl && (
                <a
                  href={track.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Play preview of ${track.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 text-accent hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:opacity-100"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
