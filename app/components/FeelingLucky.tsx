"use client";

import { useState, useCallback } from "react";
import { Sparkles, Shuffle } from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useToast } from "./ToastContext";

const RSS_URL =
  "https://rss.applemarketingtools.com/api/v2/us/music/most-played/25/songs.json";

interface RSSResult {
  id: string;
  name: string;
  artistName: string;
  artworkUrl100: string;
}

const SURPRISE_GENRES = ["pop", "rock", "jazz", "electronic", "hip-hop", "classical", "country", "r&b", "latin", "alternative", "metal", "indie", "folk", "blues", "reggae"];
const SURPRISE_DECADES = ["1980s", "1990s", "2000s", "2010s", "2020s"];

export default function FeelingLucky({ className = "" }: { className?: string }) {
  const { play } = useAudioPlayer();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [surpriseLoading, setSurpriseLoading] = useState(false);

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
        showToast("warning", "No songs available", "Could not find any trending songs right now.");
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
      } else {
        showToast("info", "No preview available", "Could not find a playable preview for this song.");
      }
    } catch {
      showToast("error", "Something went wrong", "Could not fetch a random song. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, play, showToast]);

  const handleSurpriseMe = useCallback(async () => {
    if (surpriseLoading) return;
    setSurpriseLoading(true);

    try {
      // Pick random genre + random decade
      const randomGenre = SURPRISE_GENRES[Math.floor(Math.random() * SURPRISE_GENRES.length)];
      const randomDecade = SURPRISE_DECADES[Math.floor(Math.random() * SURPRISE_DECADES.length)];
      const decadeYear = parseInt(randomDecade.replace("s", ""), 10);

      const searchQuery = `${randomGenre} ${decadeYear}s music`;
      const itunesResponse = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&entity=song&limit=20`
      );

      if (!itunesResponse.ok) throw new Error("Failed to search iTunes");
      const itunesData = await itunesResponse.json();
      const results = itunesData?.results || [];

      // Filter to matching decade
      const decadeResults = results.filter((r: { releaseDate?: string }) => {
        if (!r.releaseDate) return true;
        const year = new Date(r.releaseDate).getFullYear();
        return year >= decadeYear && year < decadeYear + 10;
      });

      const pool = decadeResults.length > 0 ? decadeResults : results;
      const withPreview = pool.filter((r: { previewUrl?: string }) => r.previewUrl);

      if (withPreview.length === 0) {
        showToast("info", "No preview found", `Could not find a playable ${randomGenre} track from the ${randomDecade}. Try again!`);
        return;
      }

      const match = withPreview[Math.floor(Math.random() * withPreview.length)];
      showToast("info", "Surprise!", `${randomGenre} from the ${randomDecade}`);

      play(match.previewUrl, match.trackId, {
        trackName: match.trackName,
        artistName: match.artistName,
        artworkUrl: match.artworkUrl100,
        fullTrack: match,
      });
    } catch {
      showToast("error", "Something went wrong", "Could not fetch a surprise song. Please try again.");
    } finally {
      setSurpriseLoading(false);
    }
  }, [surpriseLoading, play, showToast]);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="group inline-flex items-center gap-2 rounded-xl glass-card px-5 py-3 font-medium text-foreground transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
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

      <button
        type="button"
        onClick={handleSurpriseMe}
        disabled={surpriseLoading}
        className="group inline-flex items-center gap-2 rounded-xl glass-card px-5 py-3 font-medium text-foreground transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
        aria-label="Play a random song from a random genre and decade"
      >
        <Shuffle
          size={18}
          className={`text-primary transition-transform duration-300 group-hover:rotate-180 ${surpriseLoading ? "animate-pulse" : ""}`}
          aria-hidden="true"
        />
        <span className="text-sm">
          {surpriseLoading ? "Surprising you..." : "Surprise Me"}
        </span>
      </button>
    </div>
  );
}
