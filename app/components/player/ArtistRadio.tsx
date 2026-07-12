"use client";

import { useState, useCallback } from "react";
import { Radio } from "lucide-react";
import { useAudioPlayer } from "../AudioPlayerContext";
import type { ItunesTrack } from "@/lib/types";

interface ArtistRadioProps {
  artistId: number;
  artistName: string;
  className?: string;
}

/**
 * Artist Radio button that fetches more tracks from the same artist
 * and queues them automatically for continuous playback.
 * Uses the iTunes lookup API to get artist tracks without an API key.
 */
export default function ArtistRadio({
  artistId,
  artistName,
  className = "",
}: ArtistRadioProps) {
  const { addToQueue, play, currentlyPlayingId } = useAudioPlayer();
  const [isLoading, setIsLoading] = useState(false);
  const [isQueued, setIsQueued] = useState(false);

  const startRadio = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=25`
      );
      if (!response.ok) return;

      const data = await response.json();
      const tracks: ItunesTrack[] = data.results.filter(
        (item: { wrapperType: string; trackId?: number }) =>
          item.wrapperType === "track" && item.trackId !== currentlyPlayingId
      );

      if (tracks.length === 0) return;

      // Shuffle the tracks for variety
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      const playable = shuffled.filter((t) => t.previewUrl);

      if (playable.length === 0) return;

      // If nothing is currently playing, start the first track
      if (!currentlyPlayingId) {
        const first = playable[0];
        play(first.previewUrl!, first.trackId, {
          trackName: first.trackName,
          artistName: first.artistName,
          artworkUrl: first.artworkUrl100?.replace("100x100", "200x200"),
          fullTrack: first,
        });
        // Queue the rest
        for (let i = 1; i < playable.length; i++) {
          addToQueue(playable[i]);
        }
      } else {
        // Just queue all tracks
        for (const track of playable) {
          addToQueue(track);
        }
      }

      setIsQueued(true);
    } catch {
      // Gracefully handle errors
    } finally {
      setIsLoading(false);
    }
  }, [artistId, currentlyPlayingId, addToQueue, play]);

  return (
    <button
      onClick={startRadio}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/30 hover:bg-foreground/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={`Start ${artistName} radio - queue more tracks from this artist`}
    >
      <Radio
        className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      <span>
        {isLoading
          ? "Loading..."
          : isQueued
            ? "More Added"
            : `${artistName} Radio`}
      </span>
    </button>
  );
}
