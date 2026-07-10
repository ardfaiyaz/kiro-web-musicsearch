"use client";

import { useEffect, useState } from "react";
import { ItunesTrack } from "@/lib/types";
import TrackGrid from "./TrackGrid";

interface RecommendationsProps {
  trackId: number;
}

export default function Recommendations({ trackId }: RecommendationsProps) {
  const [tracks, setTracks] = useState<ItunesTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecommendations() {
      setLoading(true);
      setError(false);
      setTracks([]);

      try {
        const response = await fetch(
          `/api/recommendations?trackId=${trackId}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setTracks(data.recommendations || []);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [trackId]);

  if (loading) {
    return (
      <section className="mt-12" aria-label="Loading recommendations">
        <h2 className="mb-6 text-xl font-bold text-foreground">
          You Might Also Like
        </h2>
        <div
          className="flex flex-col items-center justify-center gap-4 py-16"
          role="status"
          aria-label="Loading recommendations"
        >
          <svg
            className="h-10 w-10 animate-spin text-accent"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-muted">
            Finding songs you might enjoy...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-12" aria-label="Recommendations error">
        <h2 className="mb-4 text-xl font-bold text-foreground">
          You Might Also Like
        </h2>
        <p className="text-sm text-muted">
          Unable to load recommendations at this time. Please try again later.
        </p>
      </section>
    );
  }

  if (tracks.length === 0) {
    return (
      <section className="mt-12" aria-label="No recommendations">
        <h2 className="mb-4 text-xl font-bold text-foreground">
          You Might Also Like
        </h2>
        <p className="text-sm text-muted">
          No recommendations available for this track right now.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12" aria-label="Recommended tracks">
      <h2 className="mb-6 text-xl font-bold text-foreground">
        You Might Also Like
      </h2>
      <TrackGrid tracks={tracks} />
    </section>
  );
}
