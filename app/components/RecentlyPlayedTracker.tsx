"use client";

import { useEffect, useRef } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { usePersonalization } from "./PersonalizationContext";
import { ItunesTrack } from "@/lib/types";

/**
 * This component tracks when audio starts playing and records it
 * in the recently played list. It renders no UI.
 */
export default function RecentlyPlayedTracker() {
  const { currentlyPlayingId, trackName, artistName, artworkUrl } =
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

      // Create a minimal ItunesTrack-like object for recently played storage
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
  }, [currentlyPlayingId, trackName, artistName, artworkUrl, addRecentlyPlayed]);

  return null;
}
