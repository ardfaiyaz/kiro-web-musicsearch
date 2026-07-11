"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import YouTubeEmbed from "./YouTubeEmbed";

interface Video {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
}

interface ArtistVideosProps {
  query: string;
}

export default function ArtistVideos({ query }: ArtistVideosProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/youtube?query=${encodeURIComponent(query)}&limit=8`
        );
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        }
      } catch {
        // Gracefully handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideos();
  }, [query]);

  if (!isLoading && videos.length === 0) {
    return null;
  }

  const featuredVideo = activeVideo || videos[0];
  const thumbnailVideos = activeVideo
    ? videos.filter((v) => v.videoId !== activeVideo.videoId)
    : videos.slice(1);

  return (
    <section id="videos" className="animate-on-scroll-slide-up" aria-label="Music videos">
      <h2 className="mb-6 text-2xl font-bold text-foreground tracking-tight">
        Videos
      </h2>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="aspect-video w-full rounded-2xl shimmer-wave" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3" aria-hidden="true">
                <div className="h-16 w-28 shrink-0 rounded-lg shimmer-wave" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3 w-full rounded shimmer-wave" />
                  <div className="h-3 w-2/3 rounded shimmer-wave" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Featured video */}
          <div className="lg:col-span-2">
            {featuredVideo && (
              <div className="overflow-hidden rounded-2xl">
                <YouTubeEmbed
                  videoId={featuredVideo.videoId}
                  title={featuredVideo.title}
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {featuredVideo.title}
                    </p>
                    <p className="text-xs text-muted">{featuredVideo.channelTitle}</p>
                  </div>
                  {activeVideo && (
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="shrink-0 rounded-full border border-border p-2 text-muted transition-premium hover:text-foreground hover:border-foreground/20"
                      aria-label="Close video and return to default"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail grid */}
          <div className="flex flex-col gap-3 lg:col-span-1">
            {thumbnailVideos.slice(0, 5).map((video) => (
              <button
                key={video.videoId}
                onClick={() => setActiveVideo(video)}
                className="group flex items-start gap-3 rounded-xl p-2 text-left transition-premium hover:bg-surface"
                aria-label={`Play video: ${video.title}`}
              >
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-border">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="112px"
                    className="object-cover transition-premium group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-6 w-6 text-white" fill="white" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="line-clamp-2 text-xs font-medium text-foreground transition-premium group-hover:text-primary">
                    {video.title}
                  </p>
                  <p className="text-[10px] text-muted">{video.channelTitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
