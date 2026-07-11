"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface RecentlyPlayedAlbumsProps {
  history: HistoryEntry[];
}

interface AlbumSummary {
  albumName: string;
  artistName: string;
  artworkUrl: string;
  tracksPlayed: number;
  lastPlayed: number;
}

export default function RecentlyPlayedAlbums({ history }: RecentlyPlayedAlbumsProps) {
  const albums = useMemo((): AlbumSummary[] => {
    const albumMap = new Map<string, AlbumSummary>();

    for (const entry of history) {
      const key = `${entry.albumName}::${entry.artistName}`;
      const existing = albumMap.get(key);
      if (existing) {
        existing.tracksPlayed++;
        if (entry.playedAt > existing.lastPlayed) {
          existing.lastPlayed = entry.playedAt;
          existing.artworkUrl = entry.artworkUrl;
        }
      } else {
        albumMap.set(key, {
          albumName: entry.albumName,
          artistName: entry.artistName,
          artworkUrl: entry.artworkUrl,
          tracksPlayed: 1,
          lastPlayed: entry.playedAt,
        });
      }
    }

    return [...albumMap.values()]
      .sort((a, b) => b.lastPlayed - a.lastPlayed)
      .slice(0, 12);
  }, [history]);

  if (albums.length === 0) return null;

  return (
    <section aria-label="Recently played albums" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Disc3 className="h-5 w-5 text-muted" aria-hidden="true" />
        Recent Albums
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {albums.map((album) => (
          <article
            key={`${album.albumName}-${album.artistName}`}
            className="group rounded-2xl glass-light p-3 transition-premium hover:shadow-lg hover:bg-foreground/5"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl">
              <Image
                src={album.artworkUrl.replace("100x100", "300x300")}
                alt={`${album.albumName} by ${album.artistName}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            </div>
            <div className="mt-3 space-y-1">
              <h4 className="truncate text-sm font-medium text-foreground">
                {album.albumName}
              </h4>
              <p className="truncate text-xs text-muted">{album.artistName}</p>
              <p className="text-xs text-muted">
                {album.tracksPlayed} {album.tracksPlayed === 1 ? "track" : "tracks"} played
              </p>
            </div>
            <Link
              href={`/?q=${encodeURIComponent(album.albumName + " " + album.artistName)}`}
              className="mt-2 inline-flex min-h-[44px] items-center rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-premium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
              aria-label={`Open ${album.albumName}`}
            >
              Open Album
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
