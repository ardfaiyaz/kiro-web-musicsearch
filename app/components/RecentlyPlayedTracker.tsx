"use client";

import { useEffect, useRef } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { usePersonalization } from "./PersonalizationContext";
import { ItunesTrack } from "@/lib/types";

/**
 * This component tracks when audio starts playing and records it
 * in the recently played list. It renders no UI.
 *
 * When a full ItunesTrack object is available (passed via AudioPlayerContext),
 * it stores the complete track data including genre, artist ID, etc.
 * Otherwise it creates a minimal record with the available metadata.
 */
export default function RecentlyPlayedTracker() {
  const { currentlyPlayingId, trackName, artistName, artworkUrl, currentTrack } =
    useAudioPlayer();
  const { addRecentlyPlayed } = usePersonalization();
  const lastTrackedId = useRef<number | null>(null);

  useEffect(() => {
    if (
      currentlyPlayingId !== null &&
      currentlyPlayingId !== lastTrackedId.current &&
      trackName
    ) {
      lastTrackedId.current = currentlyPlayingId;

      // Prefer the full track object if available (preserves genre, artistId, etc.)
      if (currentTrack && currentTrack.trackId === currentlyPlayingId) {
        addRecentlyPlayed(currentTrack);
      } else {
        // Fallback: create a minimal ItunesTrack-like object with available metadata
        const trackData: ItunesTrack = {
          trackId: currentlyPlayingId,
          trackName: trackName,
          artistName: artistName || "Unknown Artist",
          artistId: 0,
          collectionName: "",
          artworkUrl100: artworkUrl || "",
          previewUrl: null,
          primaryGenreName: "",
          releaseDate: "",
          trackTimeMillis: 0,
          trackViewUrl: "",
          collectionViewUrl: "",
          kind: "song",
          wrapperType: "track",
        };

        addRecentlyPlayed(trackData);
      }
    }
  }, [currentlyPlayingId, trackName, artistName, artworkUrl, currentTrack, addRecentlyPlayed]);

  return null;
}
