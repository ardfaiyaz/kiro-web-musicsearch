import { ItunesTrack, ItunesArtist, ItunesAlbum } from "./types";

const RECENTLY_PLAYED_KEY = "music-search-recently-played";
const FAVORITE_ARTISTS_KEY = "music-search-favorite-artists";
const FAVORITE_ALBUMS_KEY = "music-search-favorite-albums";
const PLAYLISTS_KEY = "music-search-playlists";

const MAX_RECENTLY_PLAYED = 50;

export interface Playlist {
  id: string;
  name: string;
  tracks: ItunesTrack[];
  createdAt: number;
}

// --- Recently Played ---

export function getRecentlyPlayed(): ItunesTrack[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentlyPlayed(track: ItunesTrack): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyPlayed();
    const filtered = existing.filter((t) => t.trackId !== track.trackId);
    const updated = [track, ...filtered].slice(0, MAX_RECENTLY_PLAYED);
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded when saving recently played tracks. Some data may not be persisted.");
    }
  }
}

// --- Favorite Artists ---

export function getFavoriteArtists(): ItunesArtist[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITE_ARTISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFavoriteArtist(artist: ItunesArtist): void {
  if (typeof window === "undefined") return;
  const artists = getFavoriteArtists();
  if (artists.some((a) => a.artistId === artist.artistId)) return;
  artists.push(artist);
  try {
    localStorage.setItem(FAVORITE_ARTISTS_KEY, JSON.stringify(artists));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded when saving favorite artists. Some data may not be persisted.");
    }
  }
}

export function removeFavoriteArtist(artistId: number): void {
  if (typeof window === "undefined") return;
  const artists = getFavoriteArtists();
  const updated = artists.filter((a) => a.artistId !== artistId);
  try {
    localStorage.setItem(FAVORITE_ARTISTS_KEY, JSON.stringify(updated));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded. Some data may not be persisted.");
    }
  }
}

export function isArtistFavorite(artistId: number): boolean {
  return getFavoriteArtists().some((a) => a.artistId === artistId);
}

// --- Favorite Albums ---

export function getFavoriteAlbums(): ItunesAlbum[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITE_ALBUMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFavoriteAlbum(album: ItunesAlbum): void {
  if (typeof window === "undefined") return;
  const albums = getFavoriteAlbums();
  if (albums.some((a) => a.collectionId === album.collectionId)) return;
  albums.push(album);
  try {
    localStorage.setItem(FAVORITE_ALBUMS_KEY, JSON.stringify(albums));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded when saving favorite albums. Some data may not be persisted.");
    }
  }
}

export function removeFavoriteAlbum(collectionId: number): void {
  if (typeof window === "undefined") return;
  const albums = getFavoriteAlbums();
  const updated = albums.filter((a) => a.collectionId !== collectionId);
  try {
    localStorage.setItem(FAVORITE_ALBUMS_KEY, JSON.stringify(updated));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded. Some data may not be persisted.");
    }
  }
}

export function isAlbumFavorite(collectionId: number): boolean {
  return getFavoriteAlbums().some((a) => a.collectionId === collectionId);
}

// --- Playlists ---

export function getPlaylists(): Playlist[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PLAYLISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function createPlaylist(name: string): Playlist {
  const playlist: Playlist = {
    id: `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    tracks: [],
    createdAt: Date.now(),
  };
  const playlists = getPlaylists();
  playlists.push(playlist);
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded when creating playlist. Some data may not be persisted.");
    }
  }
  return playlist;
}

export function deletePlaylist(playlistId: string): void {
  if (typeof window === "undefined") return;
  const playlists = getPlaylists();
  const updated = playlists.filter((p) => p.id !== playlistId);
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded. Some data may not be persisted.");
    }
  }
}

export function addTrackToPlaylist(
  playlistId: string,
  track: ItunesTrack
): void {
  if (typeof window === "undefined") return;
  const playlists = getPlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return;
  if (playlist.tracks.some((t) => t.trackId === track.trackId)) return;
  playlist.tracks.push(track);
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded when adding track to playlist. Some data may not be persisted.");
    }
  }
}

export function removeTrackFromPlaylist(
  playlistId: string,
  trackId: number
): void {
  if (typeof window === "undefined") return;
  const playlists = getPlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return;
  playlist.tracks = playlist.tracks.filter((t) => t.trackId !== trackId);
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Music Search] localStorage quota exceeded. Some data may not be persisted.");
    }
  }
}

// Storage keys exports for cross-tab detection
export const PERSONALIZATION_STORAGE_KEYS = {
  recentlyPlayed: RECENTLY_PLAYED_KEY,
  favoriteArtists: FAVORITE_ARTISTS_KEY,
  favoriteAlbums: FAVORITE_ALBUMS_KEY,
  playlists: PLAYLISTS_KEY,
};
