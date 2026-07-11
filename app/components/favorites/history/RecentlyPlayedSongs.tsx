"use client";

import { useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import { Play, Heart, Trash2 } from "lucide-react";
import { useFavorites } from "@/app/components/FavoritesContext";
import type { HistoryEntry } from "@/lib/personalization";
import type { ItunesTrack } from "@/lib/types";

interface RecentlyPlayedSongsProps {
  history: HistoryEntry[];
  onRemove: (trackId: number, playedAt: number) => void;
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

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatRelativeTime(timestamp: number, now: number): string {
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function RecentlyPlayedSongs({ history, onRemove }: RecentlyPlayedSongsProps) {
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const toggleFavorite = useCallback(
    (entry: HistoryEntry) => {
      const isFav = favorites.some((f) => f.trackId === entry.trackId);
      if (isFav) {
        removeFavorite(entry.trackId);
      } else {
        const track: ItunesTrack = {
          trackId: entry.trackId,
          trackName: entry.trackName,
          artistName: entry.artistName,
          artistId: 0,
          collectionId: 0,
          collectionName: entry.albumName,
          artworkUrl100: entry.artworkUrl,
          previewUrl: entry.previewUrl || "",
          primaryGenreName: entry.primaryGenreName,
          releaseDate: "",
          trackTimeMillis: entry.duration,
          trackViewUrl: "",
          collectionViewUrl: "",
          kind: "song",
          wrapperType: "track",
        };
        addFavorite(track);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  if (history.length === 0) return null;

  const displayedSongs = history.slice(0, 20);

  return (
    <section aria-label="Recently played songs" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Recent Songs
      </h3>
      <ul className="space-y-1" role="list">
        {displayedSongs.map((entry) => {
          const isFav = favorites.some((f) => f.trackId === entry.trackId);
          return (
            <li
              key={`${entry.trackId}-${entry.playedAt}`}
              className="flex items-center gap-3 rounded-xl glass-light p-3 transition-premium hover:bg-foreground/5"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={entry.artworkUrl}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {entry.trackName}
                </p>
                <p className="truncate text-xs text-muted">
                  {entry.artistName} &middot; {entry.albumName}
                </p>
              </div>

              {/* Progress indicator if incomplete */}
              {!entry.completed && entry.progress > 0 && (
                <div
                  className="h-1 w-12 overflow-hidden rounded-full bg-foreground/10"
                  role="progressbar"
                  aria-valuenow={Math.round(entry.progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${Math.round(entry.progress)}% played`}
                >
                  <div
                    className="h-full rounded-full bg-foreground/50"
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
              )}

              <span className="shrink-0 text-xs text-muted">
                {formatDuration(entry.duration)}
              </span>
              <span className="shrink-0 text-xs text-muted">
                {formatRelativeTime(entry.playedAt, now)}
              </span>

              {/* Resume / Play button */}
              {entry.previewUrl && (
                <a
                  href={entry.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-muted transition-premium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                  aria-label={`Play ${entry.trackName}`}
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                </a>
              )}

              {/* Favorite toggle */}
              <button
                type="button"
                onClick={() => toggleFavorite(entry)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-muted transition-premium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                aria-label={isFav ? `Remove ${entry.trackName} from favorites` : `Add ${entry.trackName} to favorites`}
                aria-pressed={isFav}
              >
                <Heart
                  className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(entry.trackId, entry.playedAt)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-muted transition-premium hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                aria-label={`Remove ${entry.trackName} from history`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
