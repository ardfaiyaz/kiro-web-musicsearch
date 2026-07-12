"use client";

import { useCallback } from "react";
import { Play } from "lucide-react";
import { useAudioPlayer } from "../AudioPlayerContext";
import type { ItunesTrack } from "@/lib/types";

interface AlbumAutoPlayProps {
  tracks: ItunesTrack[];
  albumName: string;
}

/**
 * Auto-play all previews button for album pages.
 * Queues all album tracks and starts playing the first one sequentially
 * using the existing queue system in AudioPlayerContext.
 */
export default function AlbumAutoPlay({ tracks, albumName }: AlbumAutoPlayProps) {
  const { play, addToQueue, clearQueue, currentlyPlayingId } = useAudioPlayer();

  const playableTracks = tracks.filter((t) => t.previewUrl);

  const handleAutoPlay = useCallback(() => {
    if (playableTracks.length === 0) return;

    // Clear existing queue
    clearQueue();

    // Play the first track
    const firstTrack = playableTracks[0];
    play(firstTrack.previewUrl!, firstTrack.trackId, {
      trackName: firstTrack.trackName,
      artistName: firstTrack.artistName,
      artworkUrl: firstTrack.artworkUrl100?.replace("100x100", "200x200"),
      fullTrack: firstTrack,
    });

    // Add remaining tracks to queue
    for (let i = 1; i < playableTracks.length; i++) {
      addToQueue(playableTracks[i]);
    }
  }, [playableTracks, play, addToQueue, clearQueue]);

  if (playableTracks.length === 0) return null;

  const isAlbumPlaying = playableTracks.some(
    (t) => t.trackId === currentlyPlayingId
  );

  return (
    <button
      onClick={handleAutoPlay}
      className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-lg transition-all hover:scale-105 hover:bg-foreground/90 active:scale-95"
      aria-label={`Auto-play all ${playableTracks.length} previews from ${albumName}`}
    >
      <Play className="h-4 w-4 fill-current" aria-hidden="true" />
      <span>
        {isAlbumPlaying ? "Restart Album" : "Play All Previews"}
      </span>
      <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">
        {playableTracks.length}
      </span>
    </button>
  );
}
