"use client";

import { useMemo } from "react";
import { Route } from "lucide-react";
import Image from "next/image";
import type { HistoryEntry } from "@/lib/personalization";

interface MusicalJourneyProps {
  history: HistoryEntry[];
}

interface ArtistDiscovery {
  artistName: string;
  artworkUrl: string;
  firstListened: number;
  dateLabel: string;
}

export default function MusicalJourney({ history }: MusicalJourneyProps) {
  const discoveries = useMemo((): ArtistDiscovery[] => {
    if (history.length === 0) return [];

    // Find first listen for each artist (history is sorted newest first)
    const artistFirstListen = new Map<
      string,
      { artworkUrl: string; playedAt: number }
    >();

    // Iterate in reverse to find first appearance
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i];
      if (!artistFirstListen.has(entry.artistName)) {
        artistFirstListen.set(entry.artistName, {
          artworkUrl: entry.artworkUrl,
          playedAt: entry.playedAt,
        });
      }
    }

    // Sort chronologically
    return Array.from(artistFirstListen.entries())
      .map(([artistName, data]) => ({
        artistName,
        artworkUrl: data.artworkUrl,
        firstListened: data.playedAt,
        dateLabel: new Date(data.playedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }))
      .sort((a, b) => a.firstListened - b.firstListened)
      .slice(-15); // Show last 15 discovered artists
  }, [history]);

  if (discoveries.length === 0) return null;

  return (
    <section aria-label="Musical journey timeline" className="space-y-4">
      <div className="flex items-center gap-2">
        <Route className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Musical Journey
        </h3>
        <span className="ml-auto text-xs text-muted">
          {discoveries.length} artists discovered
        </span>
      </div>

      <div className="rounded-xl glass-subtle p-4">
        <div className="relative pl-8">
          {/* Vertical timeline line */}
          <div
            className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-400/50 via-blue-400/50 to-green-400/50"
            aria-hidden="true"
          />

          <div className="space-y-4">
            {discoveries.map((artist, index) => (
              <div
                key={`${artist.artistName}-${artist.firstListened}`}
                className="relative flex items-center gap-4 group"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-[-22px] h-3 w-3 rounded-full border-2 transition-colors ${
                    index === discoveries.length - 1
                      ? "border-green-400 bg-green-400"
                      : index === 0
                        ? "border-purple-400 bg-purple-400/50"
                        : "border-blue-400/50 bg-background group-hover:bg-blue-400/50"
                  }`}
                  aria-hidden="true"
                />

                {/* Artist artwork */}
                <div className="shrink-0 h-10 w-10 rounded-lg overflow-hidden glass-light">
                  <Image
                    src={artist.artworkUrl.replace("100x100", "60x60")}
                    alt={artist.artistName}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {artist.artistName}
                  </p>
                  <p className="text-[10px] text-muted">
                    First listened: {artist.dateLabel}
                  </p>
                </div>

                {/* Order badge */}
                <span className="shrink-0 text-[10px] text-muted font-mono">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
