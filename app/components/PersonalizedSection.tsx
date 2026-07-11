"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MOODS } from "@/lib/ai-discovery";
import type { RecommendedTrack } from "@/lib/ai-discovery";

interface PersonalizedSectionProps {
  initialTracks: RecommendedTrack[];
  initialMood: string;
}

export default function PersonalizedSection({
  initialTracks,
  initialMood,
}: PersonalizedSectionProps) {
  const [activeMood, setActiveMood] = useState(initialMood);
  const [tracks, setTracks] = useState<RecommendedTrack[]>(initialTracks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoodChange = async (moodId: string) => {
    if (moodId === activeMood) return;
    const previousMood = activeMood;
    setActiveMood(moodId);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/recommendations?mood=${encodeURIComponent(moodId)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
        }
      } else {
        setActiveMood(previousMood);
        setError("Failed to load recommendations. Please try again.");
      }
    } catch {
      setActiveMood(previousMood);
      setError("Failed to load recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="animate-on-scroll-slide-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Personalized recommendations"
    >
      <div className="mb-8 flex items-center gap-3">
        <Sparkles size={24} className="text-warning" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
          For You
        </h3>
      </div>

      {/* Mood selector row */}
      <div
        className="mb-8 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Select a mood"
      >
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodChange(mood.id)}
            role="tab"
            aria-selected={activeMood === mood.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-premium ${
              activeMood === mood.id
                ? "bg-foreground text-background shadow-md"
                : "border border-border text-muted hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            <span aria-hidden="true">{mood.emoji}</span>
            {mood.name}
          </button>
        ))}
      </div>

      {/* Error feedback */}
      {error && (
        <div
          className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Tracks grid */}
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        role="tabpanel"
        aria-label={`Recommendations for ${activeMood} mood`}
      >
        {loading ? (
          // Shimmer loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border/50 p-3"
            >
              <div className="h-14 w-14 shrink-0 rounded-lg shimmer-wave" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-3/4 rounded shimmer-wave" />
                <div className="h-3 w-1/2 rounded shimmer-wave" />
              </div>
            </div>
          ))
        ) : tracks.length > 0 ? (
          tracks.slice(0, 9).map((track) => (
            <Link
              key={track.trackId}
              href={`/track/${track.trackId}`}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-surface/50 p-3 transition-premium hover:border-foreground/10 hover:bg-surface hover:shadow-md"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-border shadow-sm">
                {track.artworkUrl100 ? (
                  <Image
                    src={track.artworkUrl100.replace("100x100", "200x200")}
                    alt={`${track.trackName} artwork`}
                    fill
                    sizes="56px"
                    className="object-cover transition-premium group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-border">
                    <Sparkles
                      size={16}
                      className="text-muted"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-semibold text-foreground">
                  {track.trackName}
                </span>
                <span className="truncate text-xs text-muted">
                  {track.artistName}
                </span>
                <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-muted">
                  {track.reason}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-sm text-muted">
            No recommendations available for this mood.
          </p>
        )}
      </div>
    </section>
  );
}
