"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MOODS, ACTIVITIES, RecommendedTrack } from "@/lib/ai-discovery";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function DiscoveryMoodSelector() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"mood" | "activity" | null>(null);
  const [tracks, setTracks] = useState<RecommendedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSelection(id: string, type: "mood" | "activity") {
    if (selectedCategory === id && selectedType === type) {
      setSelectedCategory(null);
      setSelectedType(null);
      setTracks([]);
      return;
    }

    setSelectedCategory(id);
    setSelectedType(type);
    setLoading(true);
    setError(false);
    setTracks([]);

    try {
      const endpoint =
        type === "mood"
          ? `/api/recommendations/mood?mood=${encodeURIComponent(id)}`
          : `/api/recommendations/activity?activity=${encodeURIComponent(id)}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        setError(true);
        return;
      }

      const data = await response.json();

      if (data.error) {
        setError(true);
      } else {
        setTracks(data.tracks || []);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Moods */}
      <div>
        <h4 className="mb-4 text-lg font-semibold text-foreground">Moods</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleSelection(mood.id, "mood")}
              className={`group glass-card flex flex-col items-center gap-2 p-4 transition-premium hover:-translate-y-1 hover:shadow-lg ${
                selectedCategory === mood.id && selectedType === "mood"
                  ? "ring-2 ring-foreground/20 border-foreground/20"
                  : ""
              }`}
              aria-pressed={selectedCategory === mood.id && selectedType === "mood"}
              aria-label={`${mood.name} mood`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${mood.gradient} text-2xl shadow-lg`}
              >
                {mood.emoji}
              </div>
              <span className="text-sm font-medium text-foreground">{mood.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div>
        <h4 className="mb-4 text-lg font-semibold text-foreground">Activities</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ACTIVITIES.map((activity) => (
            <button
              key={activity.id}
              onClick={() => handleSelection(activity.id, "activity")}
              className={`group glass-card flex flex-col items-center gap-2 p-4 transition-premium hover:-translate-y-1 hover:shadow-lg ${
                selectedCategory === activity.id && selectedType === "activity"
                  ? "ring-2 ring-foreground/20 border-foreground/20"
                  : ""
              }`}
              aria-pressed={
                selectedCategory === activity.id && selectedType === "activity"
              }
              aria-label={`${activity.name} activity`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${activity.gradient} text-2xl shadow-lg`}
              >
                {activity.emoji}
              </div>
              <span className="text-sm font-medium text-foreground">
                {activity.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {(loading || error || tracks.length > 0) && (
        <div className="glass-recommendation p-6" aria-live="polite">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
                <span className="text-sm text-muted">
                  Finding {selectedType === "mood" ? "mood" : "activity"}-based
                  recommendations...
                </span>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-muted">
                Unable to load recommendations. Please try again.
              </p>
            </div>
          )}

          {!loading && !error && tracks.length > 0 && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-foreground">
                {selectedType === "mood" ? "Mood" : "Activity"}: {selectedCategory}
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tracks.map((track) => (
                  <Link
                    key={track.trackId}
                    href={`/track/${track.trackId}`}
                    className="group flex items-center gap-3 rounded-xl border border-border/50 bg-surface/50 p-3 transition-premium hover:border-foreground/10 hover:bg-surface"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-border">
                      {track.artworkUrl100 ? (
                        <Image
                          src={track.artworkUrl100.replace("100x100", "200x200")}
                          alt={`${track.trackName} artwork`}
                          fill
                          sizes="48px"
                          className="object-cover transition-premium group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg
                            className="h-5 w-5 text-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold text-foreground group-hover:text-accent transition-premium">
                        {track.trackName}
                      </span>
                      <span className="truncate text-xs text-muted">
                        {track.artistName}
                      </span>
                      <span className="text-[10px] font-medium text-muted/80">
                        {track.reason}
                      </span>
                    </div>
                    {track.trackTimeMillis && (
                      <span className="shrink-0 text-xs text-muted/70">
                        {formatDuration(track.trackTimeMillis)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
