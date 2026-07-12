"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerContext";

const RSS_URL =
  "https://rss.applemarketingtools.com/api/v2/us/music/most-played/25/songs.json";

interface RSSResult {
  id: string;
  name: string;
  artistName: string;
  artworkUrl100: string;
}

export default function FeelingLucky({ className = "" }: { className?: string }) {
  const { play } = useAudioPlayer();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Fetch trending songs from Apple RSS
      const rssResponse = await fetch(RSS_URL);
      if (!rssResponse.ok) throw new Error("Failed to fetch trending songs");
      const rssData = await rssResponse.json();
      const songs: RSSResult[] = rssData?.feed?.results || [];

      if (songs.length === 0) {
        setLoading(false);
        return;
      }

      // Pick a random song
      const randomSong = songs[Math.floor(Math.random() * songs.length)];

      // Search iTunes for the song to get a previewUrl
      const searchQuery = `${randomSong.name} ${randomSong.artistName}`;
      const itunesResponse = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&entity=song&limit=5`
      );

      if (!itunesResponse.ok) throw new Error("Failed to search iTunes");
      const itunesData = await itunesResponse.json();
      const results = itunesData?.results || [];

      // Find the best match with a preview URL
      const match = results.find(
        (r: { previewUrl?: string }) => r.previewUrl
      );

      if (match) {
        play(match.previewUrl, match.trackId, {
          trackName: match.trackName,
          artistName: match.artistName,
          artworkUrl: match.artworkUrl100,
          fullTrack: match,
        });
      }
    } catch {
      // Silently fail - no preview available
    } finally {
      setLoading(false);
    }
  }, [loading, play]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`group inline-flex items-center gap-2 rounded-xl glass-card px-5 py-3 font-medium text-foreground transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait ${className}`}
      aria-label="Play a random trending song"
    >
      <Sparkles
        size={18}
        className={`text-accent transition-transform duration-300 group-hover:rotate-12 ${loading ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      <span className="text-sm">
        {loading ? "Finding a song..." : "Feeling Lucky"}
      </span>
    </button>
  );
}
