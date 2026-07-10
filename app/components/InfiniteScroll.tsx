"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ItunesTrack } from "@/lib/types";
import TrackCard from "./TrackCard";
import LoadingSpinner from "./LoadingSpinner";

interface InfiniteScrollProps {
  initialTracks: ItunesTrack[];
  query: string;
  entity?: string;
  genre?: string;
  year?: string;
  explicit?: string;
}

function applyGenreFilter(tracks: ItunesTrack[], genre: string): ItunesTrack[] {
  if (!genre) return tracks;
  return tracks.filter(
    (t) => t.primaryGenreName.toLowerCase().includes(genre.toLowerCase())
  );
}

function applyYearFilter(tracks: ItunesTrack[], year: string): ItunesTrack[] {
  if (!year) return tracks;
  return tracks.filter((t) => {
    const releaseYear = new Date(t.releaseDate).getFullYear();
    switch (year) {
      case "2024":
        return releaseYear === 2024;
      case "2023":
        return releaseYear === 2023;
      case "2022":
        return releaseYear === 2022;
      case "2020s":
        return releaseYear >= 2020 && releaseYear <= 2021;
      case "2010s":
        return releaseYear >= 2010 && releaseYear <= 2019;
      case "2000s":
        return releaseYear >= 2000 && releaseYear <= 2009;
      case "1990s":
        return releaseYear >= 1990 && releaseYear <= 1999;
      case "1980s":
        return releaseYear >= 1980 && releaseYear <= 1989;
      case "older":
        return releaseYear < 1980;
      default:
        return true;
    }
  });
}

function applyExplicitFilter(tracks: ItunesTrack[], explicit: string): ItunesTrack[] {
  if (!explicit) return tracks;
  if (explicit === "hide") {
    return tracks.filter((t) => t.trackExplicitness !== "explicit");
  }
  if (explicit === "only") {
    return tracks.filter((t) => t.trackExplicitness === "explicit");
  }
  return tracks;
}

export default function InfiniteScroll({
  initialTracks,
  query,
  entity,
  genre,
  year,
  explicit,
}: InfiniteScrollProps) {
  const [tracks, setTracks] = useState<ItunesTrack[]>(initialTracks);
  const [offset, setOffset] = useState(25);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTracks.length >= 25);
  const observerRef = useRef<HTMLDivElement>(null);

  // Reset when query or initialTracks change
  useEffect(() => {
    setTracks(initialTracks);
    setOffset(25);
    setHasMore(initialTracks.length >= 25);
  }, [initialTracks]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        term: query,
        media: "music",
        limit: "25",
        offset: offset.toString(),
        entity: "musicTrack",
      });

      if (entity === "song") {
        params.set("attribute", "songTerm");
      }

      const response = await fetch(
        `https://itunes.apple.com/search?${params.toString()}`
      );
      const data = await response.json();

      let newTracks = (data.results || []).filter(
        (item: { wrapperType: string }) => item.wrapperType === "track"
      ) as ItunesTrack[];

      // Apply the same filters that the server applied to the initial page
      if (genre) {
        newTracks = applyGenreFilter(newTracks, genre);
      }
      if (year) {
        newTracks = applyYearFilter(newTracks, year);
      }
      if (explicit) {
        newTracks = applyExplicitFilter(newTracks, explicit);
      }

      if (newTracks.length === 0 && data.results.length < 25) {
        // No more raw results from the API
        setHasMore(false);
      } else if (newTracks.length === 0) {
        // Filters excluded all results from this page but there may be more
        setOffset((prev) => prev + 25);
      } else {
        setTracks((prev) => [...prev, ...newTracks]);
        setOffset((prev) => prev + 25);
        if (data.results.length < 25) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to load more tracks:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, query, offset, entity, genre, year, explicit]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, hasMore, loading]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tracks.map((track) => (
          <TrackCard key={track.trackId} track={track} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerRef} className="mt-8 flex justify-center">
          {loading && <LoadingSpinner message="Loading more tracks..." />}
        </div>
      )}

      {!hasMore && tracks.length > 25 && (
        <p className="mt-8 text-center text-sm text-muted">
          No more results to show
        </p>
      )}
    </div>
  );
}
