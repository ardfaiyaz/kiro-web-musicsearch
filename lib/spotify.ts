const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

import type { SpotifyArtist, SpotifyAlbum, SpotifyTrack } from "./types";

// Token cache with in-flight promise to prevent race conditions under concurrency.
// A single promise is shared among all concurrent callers so only one token request
// is in flight at a time (thundering-herd prevention).
let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let tokenPromise: Promise<string | null> | null = null;

/**
 * Fetch a fresh token from Spotify (internal helper).
 */
async function fetchNewToken(): Promise<string | null> {
  try {
    const credentials = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Failed to get Spotify access token:",
        response.status
      );
      return null;
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return cachedToken;
  } catch (error) {
    console.error("Failed to get Spotify access token:", error);
    return null;
  }
}

/**
 * Get a Spotify access token using the client_credentials flow.
 * Tokens are cached until expiry. Concurrent callers share a single
 * in-flight request to prevent race conditions in serverless environments.
 */
export async function getSpotifyAccessToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return null;
  }

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  // Deduplicate concurrent token requests with a shared promise
  if (!tokenPromise) {
    tokenPromise = fetchNewToken().finally(() => {
      tokenPromise = null;
    });
  }

  return tokenPromise;
}

/**
 * Make an authenticated request to the Spotify API.
 */
async function spotifyFetch<T>(endpoint: string): Promise<T | null> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(
        `Spotify API error: ${response.status} for ${endpoint}`
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Spotify API request failed for ${endpoint}:`, error);
    return null;
  }
}

// Spotify API response types (internal)
interface SpotifySearchResponse {
  artists?: {
    items: SpotifyArtistRaw[];
  };
  albums?: {
    items: SpotifyAlbumRaw[];
  };
  tracks?: {
    items: SpotifyTrackRaw[];
  };
}

interface SpotifyArtistRaw {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
  images: { url: string; width: number; height: number }[];
  external_urls: { spotify: string };
}

interface SpotifyAlbumRaw {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  images: { url: string; width: number; height: number }[];
  release_date: string;
  total_tracks: number;
  album_type: string;
  external_urls: { spotify: string };
}

interface SpotifyTrackRaw {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: SpotifyAlbumRaw;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  explicit: boolean;
  track_number: number;
  external_urls: { spotify: string };
}

interface SpotifyTopTracksResponse {
  tracks: SpotifyTrackRaw[];
}

interface SpotifyAlbumsResponse {
  items: SpotifyAlbumRaw[];
}

// Transform functions
function transformArtist(raw: SpotifyArtistRaw): SpotifyArtist {
  return {
    id: raw.id,
    name: raw.name,
    genres: raw.genres,
    popularity: raw.popularity,
    followers: raw.followers.total,
    images: raw.images,
    spotifyUrl: raw.external_urls.spotify,
  };
}

function transformAlbum(raw: SpotifyAlbumRaw): SpotifyAlbum {
  return {
    id: raw.id,
    name: raw.name,
    artistName: raw.artists.map((a) => a.name).join(", "),
    images: raw.images,
    releaseDate: raw.release_date,
    totalTracks: raw.total_tracks,
    albumType: raw.album_type,
    spotifyUrl: raw.external_urls.spotify,
  };
}

function transformTrack(raw: SpotifyTrackRaw): SpotifyTrack {
  return {
    id: raw.id,
    name: raw.name,
    artistName: raw.artists.map((a) => a.name).join(", "),
    albumName: raw.album.name,
    albumImages: raw.album.images,
    durationMs: raw.duration_ms,
    popularity: raw.popularity,
    previewUrl: raw.preview_url,
    explicit: raw.explicit,
    trackNumber: raw.track_number,
    spotifyUrl: raw.external_urls.spotify,
  };
}

/**
 * Search for an artist on Spotify by name.
 */
export async function searchSpotifyArtist(
  name: string
): Promise<SpotifyArtist | null> {
  const encodedName = encodeURIComponent(name);
  const data = await spotifyFetch<SpotifySearchResponse>(
    `/search?q=${encodedName}&type=artist&limit=1`
  );

  if (!data?.artists?.items?.length) {
    return null;
  }

  return transformArtist(data.artists.items[0]);
}

/**
 * Get detailed Spotify artist information by ID.
 */
export async function getSpotifyArtistDetails(
  spotifyId: string
): Promise<SpotifyArtist | null> {
  const data = await spotifyFetch<SpotifyArtistRaw>(
    `/artists/${spotifyId}`
  );

  if (!data) {
    return null;
  }

  return transformArtist(data);
}

/**
 * Get an artist's top tracks on Spotify.
 */
export async function getSpotifyArtistTopTracks(
  spotifyId: string
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<SpotifyTopTracksResponse>(
    `/artists/${spotifyId}/top-tracks`
  );

  if (!data?.tracks) {
    return [];
  }

  return data.tracks.map(transformTrack);
}

/**
 * Get an artist's albums on Spotify.
 */
export async function getSpotifyArtistAlbums(
  spotifyId: string
): Promise<SpotifyAlbum[]> {
  const data = await spotifyFetch<SpotifyAlbumsResponse>(
    `/artists/${spotifyId}/albums?include_groups=album,single&limit=20`
  );

  if (!data?.items) {
    return [];
  }

  return data.items.map(transformAlbum);
}

/**
 * Search for an album on Spotify by name and artist.
 */
export async function searchSpotifyAlbum(
  name: string,
  artist?: string
): Promise<SpotifyAlbum | null> {
  const query = artist
    ? `album:${name} artist:${artist}`
    : `album:${name}`;
  const encodedQuery = encodeURIComponent(query);
  const data = await spotifyFetch<SpotifySearchResponse>(
    `/search?q=${encodedQuery}&type=album&limit=1`
  );

  if (!data?.albums?.items?.length) {
    return null;
  }

  return transformAlbum(data.albums.items[0]);
}

/**
 * Get detailed Spotify album information by ID.
 */
export async function getSpotifyAlbumDetails(
  spotifyId: string
): Promise<SpotifyAlbum | null> {
  const data = await spotifyFetch<SpotifyAlbumRaw>(
    `/albums/${spotifyId}`
  );

  if (!data) {
    return null;
  }

  return transformAlbum(data);
}
