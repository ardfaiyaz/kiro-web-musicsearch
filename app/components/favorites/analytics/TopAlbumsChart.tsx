"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import { Disc3 } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeTopAlbums } from "@/lib/analytics";

interface TopAlbumsChartProps {
  history: HistoryEntry[];
}

function subscribeNoop() {
  return () => {};
}

function getClientNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

function formatRelativeTime(timestamp: number, now: number): string {
  if (now === 0) return "";
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default function TopAlbumsChart({ history }: TopAlbumsChartProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);
  const topAlbums = useMemo(() => computeTopAlbums(history, 10), [history]);

  if (topAlbums.length === 0) return null;

  return (
    <section aria-label="Top albums" className="space-y-4">
      <div className="flex items-center gap-2">
        <Disc3 className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">Top Albums</h3>
      </div>

      <div className="space-y-2" role="list" aria-label="Top albums ranking">
        {topAlbums.map((album, index) => (
          <div
            key={`${album.albumName}::${album.artistName}`}
            role="listitem"
            className="flex items-center gap-3 rounded-xl glass-subtle p-3 transition-premium hover:glass-light"
          >
            {/* Rank */}
            <span className="w-6 text-center text-sm font-bold text-muted">
              {index + 1}
            </span>

            {/* Artwork */}
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={album.artworkUrl.replace("100x100", "100x100")}
                alt={`${album.albumName} artwork`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {album.albumName}
              </p>
              <p className="truncate text-xs text-muted">{album.artistName}</p>
            </div>

            {/* Listening hours */}
            <span className="hidden shrink-0 text-xs text-muted sm:block">
              {album.listeningHours}h
            </span>

            {/* Completion bar */}
            <div className="hidden w-20 shrink-0 sm:block">
              <div className="flex items-center justify-between text-[10px] text-muted mb-0.5">
                <span>{album.completionPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-foreground/60 transition-all duration-500"
                  style={{ width: `${album.completionPercent}%` }}
                />
              </div>
            </div>

            {/* Last played */}
            <span className="hidden shrink-0 text-[10px] text-muted lg:block">
              {formatRelativeTime(album.lastPlayed, now)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
