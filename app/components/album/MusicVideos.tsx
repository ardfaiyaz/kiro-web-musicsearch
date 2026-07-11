"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoItem {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
}

interface MusicVideosProps {
  query: string;
}

export default function MusicVideos({ query }: MusicVideosProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true);
      setError(false);
      try {
        const response = await fetch(
          `/api/youtube?query=${encodeURIComponent(query)}&limit=6`
        );
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideos();
  }, [query]);

  if (isLoading) {
    return (
      <section
        aria-label="Music videos"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
          Music Videos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="glass-light overflow-hidden rounded-2xl"
              aria-hidden="true"
            >
              <div className="aspect-video w-full animate-pulse bg-border" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-border" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || videos.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Music videos"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
        Music Videos
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.slice(0, 6).map((video) => (
          <a
            key={video.videoId}
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-light group overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Watch ${video.title} on YouTube`}
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={video.thumbnailUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[var(--duration-standard)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                  <Play
                    className="h-5 w-5 text-black"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="line-clamp-2 text-sm font-medium text-foreground">
                {video.title}
              </p>
              <p className="mt-1 text-xs text-muted">
                {video.channelTitle}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
