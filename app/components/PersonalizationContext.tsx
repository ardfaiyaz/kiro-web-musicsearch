"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { ItunesTrack, ItunesArtist, ItunesAlbum } from "@/lib/types";
import {
  getRecentlyPlayed,
  addRecentlyPlayed as addRecent,
  getFavoriteArtists,
  addFavoriteArtist as addArtist,
  removeFavoriteArtist as removeArtist,
  getFavoriteAlbums,
  addFavoriteAlbum as addAlbum,
  removeFavoriteAlbum as removeAlbum,
  getPlaylists,
  createPlaylist as createPl,
  deletePlaylist as deletePl,
  addTrackToPlaylist as addTrackPl,
  removeTrackFromPlaylist as removeTrackPl,
  getListeningHistory,
  addHistoryEntry as addHistoryLib,
  removeHistoryEntry as removeHistoryLib,
  clearHistory as clearHistoryLib,
  Playlist,
  HistoryEntry,
  PERSONALIZATION_STORAGE_KEYS,
} from "@/lib/personalization";

interface PersonalizationContextType {
  recentlyPlayed: ItunesTrack[];
  addRecentlyPlayed: (track: ItunesTrack) => void;
  favoriteArtists: ItunesArtist[];
  addFavoriteArtist: (artist: ItunesArtist) => void;
  removeFavoriteArtist: (artistId: number) => void;
  isArtistFavorite: (artistId: number) => boolean;
  favoriteAlbums: ItunesAlbum[];
  addFavoriteAlbum: (album: ItunesAlbum) => void;
  removeFavoriteAlbum: (collectionId: number) => void;
  isAlbumFavorite: (collectionId: number) => boolean;
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: ItunesTrack) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: number) => void;
  listeningHistory: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  removeHistoryEntry: (trackId: number, playedAt: number) => void;
  clearHistory: () => void;
}

const PersonalizationContext =
  createContext<PersonalizationContextType | null>(null);

const emptyTracks: ItunesTrack[] = [];
const emptyArtists: ItunesArtist[] = [];
const emptyAlbums: ItunesAlbum[] = [];
const emptyPlaylists: Playlist[] = [];
const emptyHistory: HistoryEntry[] = [];

export function PersonalizationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const listenersRef = useRef(new Set<() => void>());
  const recentSnapshot = useRef<ItunesTrack[]>(emptyTracks);
  const artistsSnapshot = useRef<ItunesArtist[]>(emptyArtists);
  const albumsSnapshot = useRef<ItunesAlbum[]>(emptyAlbums);
  const playlistsSnapshot = useRef<Playlist[]>(emptyPlaylists);
  const historySnapshot = useRef<HistoryEntry[]>(emptyHistory);

  const notify = useCallback(() => {
    recentSnapshot.current = getRecentlyPlayed();
    artistsSnapshot.current = getFavoriteArtists();
    albumsSnapshot.current = getFavoriteAlbums();
    playlistsSnapshot.current = getPlaylists();
    historySnapshot.current = getListeningHistory();
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const subscribe = useCallback(
    (listener: () => void) => {
      listenersRef.current.add(listener);

      // Initialize snapshots on first subscription
      recentSnapshot.current = getRecentlyPlayed();
      artistsSnapshot.current = getFavoriteArtists();
      albumsSnapshot.current = getFavoriteAlbums();
      playlistsSnapshot.current = getPlaylists();
      historySnapshot.current = getListeningHistory();

      // Listen for cross-tab localStorage changes
      const handleStorage = (event: StorageEvent) => {
        const keys = Object.values(PERSONALIZATION_STORAGE_KEYS);
        if (event.key && keys.includes(event.key)) {
          notify();
        }
      };
      window.addEventListener("storage", handleStorage);

      return () => {
        listenersRef.current.delete(listener);
        window.removeEventListener("storage", handleStorage);
      };
    },
    [notify]
  );

  const getRecentSnapshot = useCallback(() => recentSnapshot.current, []);
  const getArtistsSnapshot = useCallback(() => artistsSnapshot.current, []);
  const getAlbumsSnapshot = useCallback(() => albumsSnapshot.current, []);
  const getPlaylistsSnapshot = useCallback(
    () => playlistsSnapshot.current,
    []
  );
  const getHistorySnapshot = useCallback(() => historySnapshot.current, []);

  const getServerRecentSnapshot = useCallback(() => emptyTracks, []);
  const getServerArtistsSnapshot = useCallback(() => emptyArtists, []);
  const getServerAlbumsSnapshot = useCallback(() => emptyAlbums, []);
  const getServerPlaylistsSnapshot = useCallback(() => emptyPlaylists, []);
  const getServerHistorySnapshot = useCallback(() => emptyHistory, []);

  const recentlyPlayed = useSyncExternalStore(
    subscribe,
    getRecentSnapshot,
    getServerRecentSnapshot
  );

  const favoriteArtists = useSyncExternalStore(
    subscribe,
    getArtistsSnapshot,
    getServerArtistsSnapshot
  );

  const favoriteAlbums = useSyncExternalStore(
    subscribe,
    getAlbumsSnapshot,
    getServerAlbumsSnapshot
  );

  const playlists = useSyncExternalStore(
    subscribe,
    getPlaylistsSnapshot,
    getServerPlaylistsSnapshot
  );

  const listeningHistory = useSyncExternalStore(
    subscribe,
    getHistorySnapshot,
    getServerHistorySnapshot
  );

  const addRecentlyPlayed = useCallback(
    (track: ItunesTrack) => {
      addRecent(track);
      notify();
    },
    [notify]
  );

  const addFavoriteArtist = useCallback(
    (artist: ItunesArtist) => {
      addArtist(artist);
      notify();
    },
    [notify]
  );

  const removeFavoriteArtist = useCallback(
    (artistId: number) => {
      removeArtist(artistId);
      notify();
    },
    [notify]
  );

  const isArtistFavorite = useCallback(
    (artistId: number) => {
      return favoriteArtists.some((a) => a.artistId === artistId);
    },
    [favoriteArtists]
  );

  const addFavoriteAlbum = useCallback(
    (album: ItunesAlbum) => {
      addAlbum(album);
      notify();
    },
    [notify]
  );

  const removeFavoriteAlbum = useCallback(
    (collectionId: number) => {
      removeAlbum(collectionId);
      notify();
    },
    [notify]
  );

  const isAlbumFavorite = useCallback(
    (collectionId: number) => {
      return favoriteAlbums.some((a) => a.collectionId === collectionId);
    },
    [favoriteAlbums]
  );

  const createPlaylist = useCallback(
    (name: string) => {
      createPl(name);
      notify();
    },
    [notify]
  );

  const deletePlaylist = useCallback(
    (playlistId: string) => {
      deletePl(playlistId);
      notify();
    },
    [notify]
  );

  const addTrackToPlaylist = useCallback(
    (playlistId: string, track: ItunesTrack) => {
      addTrackPl(playlistId, track);
      notify();
    },
    [notify]
  );

  const removeTrackFromPlaylist = useCallback(
    (playlistId: string, trackId: number) => {
      removeTrackPl(playlistId, trackId);
      notify();
    },
    [notify]
  );

  const addHistoryEntry = useCallback(
    (entry: HistoryEntry) => {
      addHistoryLib(entry);
      notify();
    },
    [notify]
  );

  const removeHistoryEntry = useCallback(
    (trackId: number, playedAt: number) => {
      removeHistoryLib(trackId, playedAt);
      notify();
    },
    [notify]
  );

  const clearHistory = useCallback(() => {
    clearHistoryLib();
    notify();
  }, [notify]);

  return (
    <PersonalizationContext.Provider
      value={{
        recentlyPlayed,
        addRecentlyPlayed,
        favoriteArtists,
        addFavoriteArtist,
        removeFavoriteArtist,
        isArtistFavorite,
        favoriteAlbums,
        addFavoriteAlbum,
        removeFavoriteAlbum,
        isAlbumFavorite,
        playlists,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        listeningHistory,
        addHistoryEntry,
        removeHistoryEntry,
        clearHistory,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error(
      "usePersonalization must be used within PersonalizationProvider"
    );
  }
  return context;
}
