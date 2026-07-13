"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw, Music, Sparkles } from "lucide-react";

interface DailyTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  primaryGenreName: string;
}

interface DailyCache {
  date: string;
  tracks: DailyTrack[];
}

const STORAGE_KEY = "daily-discovery-cache";
const HISTORY_KEY = "playback-history";

const DEFAULT_GENRES = ["pop", "rock", "electronic", "hip-hop", "indie"];

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getGenresFromHistory(): string[] {
  if (typeof window === "undefined") return DEFAULT_GENRES;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return DEFAULT_GENRES;
    const history = JSON.parse(raw);
    if (!Array.isArray(history) || history.length === 0) return DEFAULT_GENRES;

    const genreCounts: Record<string, number> = {};
    for (const entry of history) {
      const genre = entry?.track?.primaryGenreName;
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    }

    const sorted = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);

    return sorted.length > 0 ? sorted.slice(0, 5) : DEFAULT_GENRES;
  } catch {
    return DEFAULT_GENRES;
  }
}

function getDailyCache(): DailyCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cache: DailyCache = JSON.parse(raw);
    if (cache.date === getTodayString() && cache.tracks.length > 0) {
      return cache;
    }
    return null;
  } catch {
    return null;
  }
}

function saveDailyCache(tracks: DailyTrack[]): void {
  if (typeof window === "undefined") return;
  try {
    const cache: DailyCache = { date: getTodayString(), tracks };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage might be full
  }
}

// Simple seed-based shuffle using today's date
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = ((s >>> 0) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function DailyDiscovery() {
  const [tracks, setTracks] = useState<DailyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyTracks = useCallback(async () => {
    // Check cache first
    const cached = getDailyCache();
    if (cached) {
      setTracks(cached.tracks);
      setLoading(false);
      return;
    }

    setLoading(true);
    const genres = getGenresFromHistory();

    // Use today's date as seed for deterministic daily results
    const today = getTodayString();
    const dateSeed = today.split("-").reduce((acc, part) => acc + parseInt(part, 10), 0);

    // Pick genres based on date seed
    const shuffledGenres = seededShuffle(genres, dateSeed);
    const searchGenre = shuffledGenres[0] || "pop";

    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchGenre + " new music")}&media=music&entity=musicTrack&limit=20`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      const allTracks: DailyTrack[] = (data.results || [])
        .filter((r: { wrapperType: string }) => r.wrapperType === "track")
        .map((r: { trackId: number; trackName: string; artistName: string; artworkUrl100: string; primaryGenreName: string }) => ({
          trackId: r.trackId,
          trackName: r.trackName,
          artistName: r.artistName,
          artworkUrl100: r.artworkUrl100,
          primaryGenreName: r.primaryGenreName,
        }));

      // Use seeded shuffle for daily consistency, then pick 5
      const dailyTracks = seededShuffle(allTracks, dateSeed).slice(0, 5);
      setTracks(dailyTracks);
      saveDailyCache(dailyTracks);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyTracks();
  }, [fetchDailyTracks]);

  if (loading) {
    return (
      <section aria-label="Daily discovery" className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles size={20} className="text-accent" aria-hidden="true" />
          <h3 className="text-xl font-bold text-foreground">Daily Discovery</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square rounded-2xl shimmer-wave" />
              <div className="h-3 w-3/4 rounded shimmer-wave" />
              <div className="h-2.5 w-1/2 rounded shimmer-wave" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <section aria-label="Daily discovery" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-accent" aria-hidden="true" />
          <div>
            <h3 className="text-xl font-bold text-foreground">Daily Discovery</h3>
            <p className="text-xs text-muted">5 fresh picks based on your taste, refreshed daily</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <RefreshCw size={12} aria-hidden="true" />
          <span>Refreshes tomorrow</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
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
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Music size={24} className="text-muted" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 p-3">
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
    </section>
  );
}
