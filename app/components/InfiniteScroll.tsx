"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ItunesTrack } from "@/lib/types";
import TrackCard from "./TrackCard";
import LoadingSpinner from "./LoadingSpinner";

interface InfiniteScrollProps {
  initialTracks: ItunesTrack[];
  query: string;
  entity?: string;
}

export default function InfiniteScroll({
  initialTracks,
  query,
  entity,
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

      const newTracks = (data.results || []).filter(
        (item: { wrapperType: string }) => item.wrapperType === "track"
      ) as ItunesTrack[];

      if (newTracks.length === 0) {
        setHasMore(false);
      } else {
        setTracks((prev) => [...prev, ...newTracks]);
        setOffset((prev) => prev + 25);
        if (newTracks.length < 25) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to load more tracks:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, query, offset, entity]);

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
