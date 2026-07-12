"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Music } from "lucide-react";

interface MoodTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  collectionName: string;
}

const MOODS = [
  { id: "happy", label: "Happy", emoji: "\u2600\uFE0F", query: "happy pop upbeat", gradient: "from-yellow-400 to-orange-400" },
  { id: "sad", label: "Sad", emoji: "\uD83C\uDF27\uFE0F", query: "sad songs melancholy", gradient: "from-blue-400 to-indigo-500" },
  { id: "energetic", label: "Energetic", emoji: "\u26A1", query: "high energy power anthem", gradient: "from-red-500 to-pink-500" },
  { id: "chill", label: "Chill", emoji: "\uD83C\uDF3F", query: "chill vibes lo-fi relaxing", gradient: "from-green-400 to-teal-400" },
  { id: "romantic", label: "Romantic", emoji: "\uD83D\uDC96", query: "love songs romantic ballad", gradient: "from-pink-400 to-rose-400" },
] as const;

export default function MoodPlaylists() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MoodTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchMoodTracks = useCallback(async (moodId: string) => {
    const mood = MOODS.find((m) => m.id === moodId);
    if (!mood) return;

    setSelectedMood(moodId);
    setLoading(true);
    setError(false);
    setTracks([]);

    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(mood.query)}&media=music&entity=musicTrack&limit=8`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const results: MoodTrack[] = (data.results || [])
        .filter((r: { wrapperType: string }) => r.wrapperType === "track")
        .slice(0, 8)
        .map((r: { trackId: number; trackName: string; artistName: string; artworkUrl100: string; collectionName: string }) => ({
          trackId: r.trackId,
          trackName: r.trackName,
          artistName: r.artistName,
          artworkUrl100: r.artworkUrl100,
          collectionName: r.collectionName,
        }));
      setTracks(results);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section aria-label="Mood-based playlists" className="mb-16">
      <h3 className="mb-2 text-2xl font-bold text-foreground">
        How are you feeling?
      </h3>
      <p className="mb-6 text-sm text-muted">
        Pick a mood and discover music that matches your vibe
      </p>

      {/* Mood selection buttons */}
      <div className="flex flex-wrap gap-3 mb-6" role="group" aria-label="Select a mood">
        {MOODS.map((mood) => {
          const isActive = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => fetchMoodTracks(mood.id)}
              aria-pressed={isActive}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${mood.gradient} text-white shadow-lg scale-105`
                  : "glass-card text-foreground hover:border-foreground/10 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              <span aria-hidden="true">{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12" aria-busy="true">
          <Loader2 size={24} className="animate-spin text-muted" aria-label="Loading mood tracks" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-muted">Could not load tracks. Please try again.</p>
        </div>
      )}

      {!loading && !error && tracks.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tracks.map((track) => (
            <Link
              key={track.trackId}
              href={`/track/${track.trackId}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-border">
                {track.artworkUrl100 ? (
                  <Image
                    src={track.artworkUrl100.replace("100x100", "300x300")}
                    alt={`${track.trackName} artwork`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Music size={24} className="text-muted" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 p-4">
                <h4 className="truncate text-sm font-semibold text-foreground">
                  {track.trackName}
                </h4>
                <p className="truncate text-xs text-muted">
                  {track.artistName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
