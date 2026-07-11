"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { useAudioPlayer } from "../AudioPlayerContext";
import { getContinueListening, type PlaybackHistoryEntry } from "@/lib/playback-history";

function subscribeToContinueListening() {
  // No-op subscriber since localStorage doesn't fire events for same-tab
  return () => {};
}

function getContinueListeningSnapshot(): PlaybackHistoryEntry | null {
  return getContinueListening();
}

function getServerSnapshot(): null {
  return null;
}

export default function ContinueListening() {
  const { play } = useAudioPlayer();
  const entry = useSyncExternalStore(
    subscribeToContinueListening,
    getContinueListeningSnapshot,
    getServerSnapshot
  );
  const [dismissed, setDismissed] = useState(false);

  const handleResume = useCallback(() => {
    if (!entry) return;
    const { track } = entry;
    if (track.previewUrl) {
      play(track.previewUrl, track.trackId, {
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl: track.artworkUrl100,
        fullTrack: track,
      });
    }
  }, [entry, play]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (!entry || dismissed) return null;

  const { track } = entry;
  const timeAgo = getTimeAgo(entry.timestamp);

  return (
    <section
      aria-label="Continue listening"
      className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex items-center gap-4">
          {/* Artwork */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-md sm:h-16 sm:w-16">
            <Image
              src={track.artworkUrl100}
              alt={`${track.trackName} artwork`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          {/* Track info */}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Continue Listening
            </span>
            <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
              {track.trackName}
            </h3>
            <p className="truncate text-xs text-muted">
              {track.artistName} &middot; {timeAgo}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleResume}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
              aria-label={`Resume playing ${track.trackName}`}
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            </button>
            <button
              onClick={handleDismiss}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function getTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}
