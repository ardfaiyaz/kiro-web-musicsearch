import { LastFmArtist, LastFmSimilarArtist } from "./types";

const LASTFM_API_KEY =
  process.env.NEXT_PUBLIC_LASTFM_API_KEY || "";
const LASTFM_BASE_URL = "https://ws.audioscrobbler.com/2.0/";

interface LastFmArtistInfoResponse {
  artist?: LastFmArtist;
  error?: number;
  message?: string;
}

interface LastFmSimilarResponse {
  similarartists?: {
    artist: LastFmSimilarArtist[];
  };
  error?: number;
  message?: string;
}

export async function getArtistInfo(
  artistName: string
): Promise<LastFmArtist | null> {
  if (!LASTFM_API_KEY) {
    return null;
  }

  try {
    const encodedName = encodeURIComponent(artistName);
    const url = `${LASTFM_BASE_URL}?method=artist.getinfo&artist=${encodedName}&api_key=${LASTFM_API_KEY}&format=json`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      return null;
    }

    const data: LastFmArtistInfoResponse = await response.json();

    if (data.error || !data.artist) {
      return null;
    }

    return data.artist;
  } catch (error) {
    console.error("Failed to fetch Last.fm artist info:", error);
    return null;
  }
}

export async function getSimilarArtists(
  artistName: string,
  limit: number = 10
): Promise<LastFmSimilarArtist[]> {
  if (!LASTFM_API_KEY) {
    return [];
  }

  try {
    const encodedName = encodeURIComponent(artistName);
    const url = `${LASTFM_BASE_URL}?method=artist.getsimilar&artist=${encodedName}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      return [];
    }

    const data: LastFmSimilarResponse = await response.json();

    if (data.error || !data.similarartists) {
      return [];
    }

    return data.similarartists.artist || [];
  } catch (error) {
    console.error("Failed to fetch similar artists:", error);
    return [];
  }
}
