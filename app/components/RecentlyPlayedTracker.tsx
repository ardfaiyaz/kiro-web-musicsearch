"use client";

import { useEffect, useRef } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { usePersonalization } from "./PersonalizationContext";
import { ItunesTrack } from "@/lib/types";
import {
  updatePlaybackProgress,
  type HistoryEntry,
} from "@/lib/personalization";

/**
 * This component tracks when audio starts playing and records it
 * in the recently played list and listening history. It renders no UI.
 *
 * When a full ItunesTrack object is available (passed via AudioPlayerContext),
 * it stores the complete track data including genre, artist ID, etc.
 * Otherwise it creates a minimal record with the available metadata.
 *
 * It also populates the listening history with HistoryEntry records,
 * tracking progress and completion for the analytics pipeline.
 */

function createSessionId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "session-";
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function RecentlyPlayedTracker() {
  const {
    currentlyPlayingId,
    trackName,
    artistName,
    artworkUrl,
    currentTrack,
    isPlaying,
    progress,
  } = useAudioPlayer();
  const { addRecentlyPlayed, addHistoryEntry } = usePersonalization();
  const lastTrackedId = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const currentEntryTrackId = useRef<number | null>(null);

  // Generate session ID once on mount
  useEffect(() => {
    sessionIdRef.current = createSessionId();
  }, []);

  // Track when a new song starts playing
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

      // Also add a history entry
      const entry: HistoryEntry = {
        trackId: currentlyPlayingId,
        trackName: trackName,
        artistName: artistName || "Unknown Artist",
        albumName: currentTrack?.collectionName || "",
        artworkUrl: currentTrack?.artworkUrl100 || artworkUrl || "",
        primaryGenreName: currentTrack?.primaryGenreName || "",
        playedAt: Date.now(),
        duration: currentTrack?.trackTimeMillis || 0,
        progress: 0,
        completed: false,
        sessionId: sessionIdRef.current || "session-default",
        previewUrl: currentTrack?.previewUrl || null,
      };

      currentEntryTrackId.current = currentlyPlayingId;
      addHistoryEntry(entry);
    }
  }, [currentlyPlayingId, trackName, artistName, artworkUrl, currentTrack, addRecentlyPlayed, addHistoryEntry]);

  // Track completion when playback ends (progress reaches ~100 and stops)
  useEffect(() => {
    if (
      !isPlaying &&
      progress >= 99 &&
      currentEntryTrackId.current !== null
    ) {
      updatePlaybackProgress(currentEntryTrackId.current, 100);
      currentEntryTrackId.current = null;
    }
  }, [isPlaying, progress]);

  return null;
}
