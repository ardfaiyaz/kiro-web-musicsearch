"use client";

import { useState } from "react";

interface YouTubeEmbedProps {
  videoId?: string;
  searchQuery?: string;
  title: string;
}

/**
 * YouTube embed component that supports both direct video IDs and search query embedding.
 * When no API key is available, uses youtube.com/results?search_query= as an iframe source
 * or the standard /embed/ endpoint for known video IDs.
 */
export default function YouTubeEmbed({
  videoId,
  searchQuery,
  title,
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    : searchQuery
      ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}`
      : null;

  if (!embedUrl) return null;

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface"
      role="region"
      aria-label={`YouTube video: ${title}`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      )}
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
