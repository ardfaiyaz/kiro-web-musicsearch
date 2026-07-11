"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, RefreshCw, Music, Gem, TrendingUp } from "lucide-react";

interface DiscoveryTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  primaryGenreName: string;
  reason: string;
}

interface AIDiscoveryPanelProps {
  query: string;
}

const MOOD_OPTIONS = [
  { id: "happy", label: "Happy", gradient: "from-yellow-400/20 to-orange-400/20" },
  { id: "chill", label: "Chill", gradient: "from-green-400/20 to-teal-400/20" },
  { id: "energetic", label: "Energetic", gradient: "from-red-500/20 to-pink-500/20" },
  { id: "sad", label: "Melancholy", gradient: "from-blue-400/20 to-indigo-500/20" },
  { id: "romantic", label: "Romantic", gradient: "from-pink-400/20 to-rose-400/20" },
  { id: "dark", label: "Dark", gradient: "from-gray-700/20 to-gray-900/20" },
];

export default function AIDiscoveryPanel({ query }: AIDiscoveryPanelProps) {
  const [tracks, setTracks] = useState<DiscoveryTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeMood, setActiveMood] = useState("chill");

  const fetchDiscovery = useCallback(async (mood: string) => {
    setLoading(true);
    setError(false);

    try {
      const searchTerm = `${mood} ${query}`;
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=musicTrack&limit=8`
      );

      if (!response.ok) {
        setError(true);
        setTracks([]);
        return;
      }

      const data = await response.json();
      const results: DiscoveryTrack[] = data.results
        .filter((r: { wrapperType: string }) => r.wrapperType === "track")
        .slice(0, 6)
        .map(
          (r: {
            trackId: number;
            trackName: string;
            artistName: string;
            artworkUrl100: string;
            primaryGenreName: string;
          }) => ({
            trackId: r.trackId,
            trackName: r.trackName,
            artistName: r.artistName,
            artworkUrl100: r.artworkUrl100,
            primaryGenreName: r.primaryGenreName,
            reason: `${mood.charAt(0).toUpperCase() + mood.slice(1)} vibes related to "${query}"`,
          })
        );

      setTracks(results);
    } catch {
      setError(true);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      fetchDiscovery(activeMood);
    }
  }, [query, activeMood, fetchDiscovery]);

  if (!query) return null;

  return (
    <section
      className="rounded-2xl glass-medium p-5 sm:p-6"
      aria-label="AI-powered music discovery"
    >
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 p-2">
            <Sparkles size={16} className="text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground sm:text-lg">
              Discover More
            </h3>
            <p className="text-xs text-muted">
              Because you searched for &ldquo;{query}&rdquo;
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchDiscovery(activeMood)}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-premium hover:text-foreground hover:border-foreground/20 disabled:opacity-50"
          aria-label="Refresh recommendations"
        >
          <RefreshCw
            size={12}
            className={loading ? "animate-spin" : ""}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {/* Mood Chips */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Select mood">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => setActiveMood(mood.id)}
            aria-pressed={activeMood === mood.id}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-premium ${
              activeMood === mood.id
                ? "bg-primary text-text-inverse"
                : "glass-subtle text-muted hover:text-foreground"
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square rounded-xl shimmer-wave" />
              <div className="h-3 w-3/4 rounded shimmer-wave" />
              <div className="h-2.5 w-1/2 rounded shimmer-wave" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Music size={24} className="text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">Could not load recommendations. Try again later.</p>
        </div>
      )}

      {!loading && !error && tracks.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tracks.map((track) => {
            const artworkUrl = track.artworkUrl100?.replace("100x100", "200x200");
            return (
              <Link
                key={track.trackId}
                href={`/track/${track.trackId}`}
                className="group flex flex-col gap-2 rounded-xl p-2 transition-premium hover:bg-foreground/5"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-border">
                  {artworkUrl ? (
                    <Image
                      src={artworkUrl}
                      alt={`${track.trackName} artwork`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-premium group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music size={20} className="text-muted" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="truncate text-xs font-medium text-foreground group-hover:text-primary transition-premium">
                    {track.trackName}
                  </span>
                  <span className="truncate text-[11px] text-muted">
                    {track.artistName}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && tracks.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Gem size={24} className="text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">No discoveries found for this combination. Try another mood.</p>
        </div>
      )}

      {/* Genre exploration shortcuts */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-muted" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Explore genres
          </span>
        </div>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Genre exploration">
          {["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Classical", "R&B", "Indie"].map((genre) => (
            <Link
              key={genre}
              href={`/?q=${encodeURIComponent(genre.toLowerCase())}`}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted transition-premium hover:border-primary/30 hover:text-foreground"
              role="listitem"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
