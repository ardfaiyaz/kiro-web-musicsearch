"use client";

import { useState, useEffect, useMemo } from "react";
import { useAudioPlayer } from "../AudioPlayerContext";

/**
 * Mini lyrics ticker that shows a single scrolling lyrics line in the mini player bar.
 * Fetches lyrics for the currently playing track and estimates the current line
 * from playback progress using even time distribution.
 */
export default function MiniLyricsTicker() {
  const { currentTrack, currentTime, duration, isPlaying, currentlyPlayingId } =
    useAudioPlayer();
  const [lyrics, setLyrics] = useState<string | null>(null);

  const trackName = currentTrack?.trackName;
  const artistNameValue = currentTrack?.artistName;

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!trackName || !artistNameValue) {
      return;
    }

    let cancelled = false;

    async function fetchLyrics() {
      try {
        const response = await fetch(
          `/api/lyrics?artist=${encodeURIComponent(artistNameValue!)}&track=${encodeURIComponent(trackName!)}`
        );
        if (response.ok && !cancelled) {
          const data = await response.json();
          setLyrics(data.lyrics || null);
        } else if (!cancelled) {
          setLyrics(null);
        }
      } catch {
        if (!cancelled) {
          setLyrics(null);
        }
      }
    }

    fetchLyrics();
    return () => {
      cancelled = true;
    };
  }, [trackName, artistNameValue]);

  const lines = useMemo(
    () => (lyrics ? lyrics.split("\n").filter((l) => l.trim().length > 0) : []),
    [lyrics]
  );

  const currentLine = useMemo(() => {
    if (!isPlaying || !currentlyPlayingId || lines.length === 0 || duration <= 0) {
      return "";
    }
    const lineIndex = Math.floor((currentTime / duration) * lines.length);
    const clampedIndex = Math.min(lineIndex, lines.length - 1);
    return lines[clampedIndex] || "";
  }, [isPlaying, currentlyPlayingId, lines, currentTime, duration]);

  if (!currentLine || !isPlaying) return null;

  return (
    <div
      className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-muted/70 italic max-w-full"
      aria-live="off"
      aria-label="Current lyric line"
    >
      {currentLine}
    </div>
  );
}
