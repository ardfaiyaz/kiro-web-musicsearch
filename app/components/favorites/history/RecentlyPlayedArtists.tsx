"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface RecentlyPlayedArtistsProps {
  history: HistoryEntry[];
}

interface ArtistSummary {
  artistName: string;
  songsPlayed: number;
  totalListeningTime: number;
  genres: string[];
  initial: string;
}

function formatListeningTime(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function RecentlyPlayedArtists({ history }: RecentlyPlayedArtistsProps) {
  const artists = useMemo((): ArtistSummary[] => {
    const artistMap = new Map<string, ArtistSummary>();

    for (const entry of history) {
      const existing = artistMap.get(entry.artistName);
      if (existing) {
        existing.songsPlayed++;
        existing.totalListeningTime += entry.duration;
        if (
          entry.primaryGenreName &&
          !existing.genres.includes(entry.primaryGenreName)
        ) {
          existing.genres.push(entry.primaryGenreName);
        }
      } else {
        artistMap.set(entry.artistName, {
          artistName: entry.artistName,
          songsPlayed: 1,
          totalListeningTime: entry.duration,
          genres: entry.primaryGenreName ? [entry.primaryGenreName] : [],
          initial: entry.artistName.charAt(0).toUpperCase(),
        });
      }
    }

    return [...artistMap.values()]
      .sort((a, b) => b.songsPlayed - a.songsPlayed)
      .slice(0, 12);
  }, [history]);

  if (artists.length === 0) return null;

  return (
    <section aria-label="Recently played artists" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Users className="h-5 w-5 text-muted" aria-hidden="true" />
        Recent Artists
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {artists.map((artist) => (
          <article
            key={artist.artistName}
            className="group flex flex-col items-center rounded-2xl glass-light p-4 text-center transition-premium hover:shadow-lg hover:bg-foreground/5"
          >
            {/* First letter avatar */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10 text-2xl font-bold text-foreground transition-transform duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              {artist.initial}
            </div>
            <div className="mt-3 w-full space-y-1">
              <h4 className="truncate text-sm font-medium text-foreground">
                {artist.artistName}
              </h4>
              <p className="text-xs text-muted">
                {artist.songsPlayed} {artist.songsPlayed === 1 ? "song" : "songs"} &middot;{" "}
                {formatListeningTime(artist.totalListeningTime)}
              </p>
              {artist.genres.length > 0 && (
                <p className="truncate text-xs text-muted">
                  {artist.genres.slice(0, 2).join(", ")}
                </p>
              )}
            </div>
            <Link
              href={`/?q=${encodeURIComponent(artist.artistName)}`}
              className="mt-2 inline-flex min-h-[44px] items-center rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-premium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
              aria-label={`Open ${artist.artistName}`}
            >
              Open Artist
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
