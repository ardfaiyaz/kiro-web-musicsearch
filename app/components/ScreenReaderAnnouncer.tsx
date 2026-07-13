"use client";

import { useEffect } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useFavorites } from "./FavoritesContext";

// Module-level state for tracking previous values
let prevTrackId: number | null = null;
let prevQueueLength = 0;
let prevFavoritesLength = 0;
let announcementEl: HTMLElement | null = null;

function announce(msg: string) {
  if (!announcementEl) return;
  // Clear then set to ensure screen readers detect the change
  announcementEl.textContent = "";
  requestAnimationFrame(() => {
    if (announcementEl) {
      announcementEl.textContent = msg;
    }
  });
}

export default function ScreenReaderAnnouncer() {
  const { queue, trackName, artistName, currentlyPlayingId } = useAudioPlayer();
  const { favorites } = useFavorites();

  // Grab DOM ref via effect
  useEffect(() => {
    announcementEl = document.getElementById("sr-announcer");
  }, []);

  // Announce track changes
  useEffect(() => {
    if (
      currentlyPlayingId !== null &&
      currentlyPlayingId !== prevTrackId &&
      trackName
    ) {
      const msg = artistName
        ? `Now playing: ${trackName} by ${artistName}`
        : `Now playing: ${trackName}`;
      announce(msg);
    }
    prevTrackId = currentlyPlayingId;
  }, [currentlyPlayingId, trackName, artistName]);

  // Announce queue changes
  useEffect(() => {
    const curLen = queue.length;
    if (curLen > prevQueueLength) {
      const diff = curLen - prevQueueLength;
      announce(
        diff === 1
          ? "Track added to queue"
          : `${diff} tracks added to queue`
      );
    } else if (curLen < prevQueueLength && curLen === 0) {
      announce("Queue cleared");
    }
    prevQueueLength = curLen;
  }, [queue.length]);

  // Announce favorites changes
  useEffect(() => {
    const curLen = favorites.length;
    if (curLen > prevFavoritesLength) {
      announce("Added to favorites");
    } else if (curLen < prevFavoritesLength) {
      announce("Removed from favorites");
    }
    prevFavoritesLength = curLen;
  }, [favorites.length]);

  return (
    <div
      id="sr-announcer"
      className="sr-only"
      aria-live="assertive"
      aria-atomic="true"
      role="status"
    />
  );
}
