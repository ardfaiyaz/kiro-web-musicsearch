"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import YouTubeEmbed from "./YouTubeEmbed";

interface Video {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
}

interface VideoSectionProps {
  query: string;
}

export default function VideoSection({ query }: VideoSectionProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/youtube?query=${encodeURIComponent(query)}&limit=6`
        );
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        }
      } catch {
        // Gracefully handle error - show empty state
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideos();
  }, [query]);

  if (!isLoading && videos.length === 0) {
    return null;
  }

  return (
    <section className="mb-12" aria-label="Music videos">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Music Videos</h2>

      {/* Active video player */}
      {activeVideo && (
        <div className="mb-6">
          <YouTubeEmbed
            videoId={activeVideo.videoId}
            title={activeVideo.title}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground truncate">
              {activeVideo.title}
            </p>
            <button
              onClick={() => setActiveVideo(null)}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-foreground/20 hover:text-foreground"
              aria-label="Close video player"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Video thumbnails */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 animate-pulse"
              aria-hidden="true"
            >
              <div className="h-32 w-56 rounded-lg bg-surface sm:h-36 sm:w-64" />
              <div className="mt-2 h-4 w-40 rounded bg-surface" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {videos.map((video) => (
            <button
              key={video.videoId}
              onClick={() => setActiveVideo(video)}
              className={`group shrink-0 text-left transition-all ${
                activeVideo?.videoId === video.videoId
                  ? "ring-2 ring-foreground/20 rounded-lg"
                  : ""
              }`}
              aria-label={`Play video: ${video.title}`}
            >
              <div className="relative h-32 w-56 overflow-hidden rounded-lg sm:h-36 sm:w-64">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  sizes="(max-width: 640px) 224px, 256px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg
                    className="h-12 w-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 w-56 truncate text-xs font-medium text-foreground sm:w-64">
                {video.title}
              </p>
              <p className="w-56 truncate text-xs text-muted sm:w-64">
                {video.channelTitle}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
