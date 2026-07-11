"use client";

import { Play, AlertTriangle } from "lucide-react";
import type { ItunesTrack } from "@/lib/types";

interface TracklistPreviewProps {
  tracks: ItunesTrack[];
}

function formatDuration(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TracklistPreview({ tracks }: TracklistPreviewProps) {
  if (tracks.length === 0) return null;

  const visibleTracks = tracks.slice(0, 20);

  return (
    <section aria-label="Tracklist preview" className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">
        Tracklist ({tracks.length} {tracks.length === 1 ? "track" : "tracks"})
      </h4>
      <div className="max-h-80 overflow-y-auto space-y-1 rounded-xl glass-subtle p-2">
        {visibleTracks.map((track) => (
          <div
            key={track.trackId}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-foreground/5"
          >
            {/* Track number */}
            <span className="w-5 shrink-0 text-right text-muted">
              {track.trackNumber || "-"}
            </span>

            {/* Track info */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="line-clamp-1 font-medium text-foreground">
                  {track.trackName}
                </span>
                {track.trackExplicitness === "explicit" && (
                  <span
                    className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-foreground/10 text-[8px] font-bold text-muted"
                    aria-label="Explicit"
                    title="Explicit"
                  >
                    E
                  </span>
                )}
              </div>
            </div>

            {/* Duration */}
            <span className="shrink-0 text-muted">
              {track.trackTimeMillis ? formatDuration(track.trackTimeMillis) : "-"}
            </span>

            {/* Play preview button */}
            {track.previewUrl && (
              <a
                href={track.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Play preview of ${track.trackName}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Play className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        ))}
        {tracks.length > 20 && (
          <p className="px-3 py-2 text-center text-[10px] text-muted">
            <AlertTriangle className="mr-1 inline-block h-3 w-3" aria-hidden="true" />
            {tracks.length - 20} more tracks not shown
          </p>
        )}
      </div>
    </section>
  );
}
