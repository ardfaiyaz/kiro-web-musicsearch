import type { YouTubeVideo } from "./types";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
}

/**
 * Search for music videos on YouTube.
 * Returns an empty array if the API key is missing or on error.
 *
 * NOTE: The YouTube Data API v3 requires the API key as a URL query parameter.
 * Header-based authentication is not supported for simple API keys. The key will
 * appear in the request URL, which means it could be captured by error-reporting
 * tools (e.g., Sentry, Datadog) that log request URLs. Ensure error reporters
 * are configured to redact the `key` parameter from logged URLs in production.
 */
export async function searchMusicVideos(
  query: string,
  limit: number = 5
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(`${query} official music video`);
    // API key must be in URL - YouTube Data API v3 does not support header-based key auth
    const url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodedQuery}&type=video&videoCategoryId=10&maxResults=${limit}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();

    if (!data.items?.length) {
      return [];
    }

    return data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error("Failed to search YouTube videos:", error);
    return [];
  }
}
