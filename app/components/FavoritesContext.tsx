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
  getFavorites,
  addFavorite as addFav,
  removeFavorite as removeFav,
} from "@/lib/favorites";
import {
  getFavoriteArtists,
  addFavoriteArtist as addArtistLib,
  removeFavoriteArtist as removeArtistLib,
  getFavoriteAlbums,
  addFavoriteAlbum as addAlbumLib,
  removeFavoriteAlbum as removeAlbumLib,
  PERSONALIZATION_STORAGE_KEYS,
} from "@/lib/personalization";

const STORAGE_KEY = "music-search-favorites";

interface FavoritesContextType {
  favorites: ItunesTrack[];
  addFavorite: (track: ItunesTrack) => void;
  removeFavorite: (trackId: number) => void;
  isFavorite: (trackId: number) => boolean;
  favoriteArtists: ItunesArtist[];
  addFavoriteArtist: (artist: ItunesArtist) => void;
  removeFavoriteArtist: (artistId: number) => void;
  isFavoriteArtist: (artistId: number) => boolean;
  favoriteAlbums: ItunesAlbum[];
  addFavoriteAlbum: (album: ItunesAlbum) => void;
  removeFavoriteAlbum: (collectionId: number) => void;
  isFavoriteAlbum: (collectionId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const emptyTracks: ItunesTrack[] = [];
const emptyArtists: ItunesArtist[] = [];
const emptyAlbums: ItunesAlbum[] = [];

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<() => void>());
  const snapshotRef = useRef<ItunesTrack[]>(emptyTracks);
  const artistsSnapshotRef = useRef<ItunesArtist[]>(emptyArtists);
  const albumsSnapshotRef = useRef<ItunesAlbum[]>(emptyAlbums);

  const notify = useCallback(() => {
    snapshotRef.current = getFavorites();
    artistsSnapshotRef.current = getFavoriteArtists();
    albumsSnapshotRef.current = getFavoriteAlbums();
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const subscribe = useCallback(
    (listener: () => void) => {
      listenersRef.current.add(listener);

      // Initialize snapshots on first subscription
      snapshotRef.current = getFavorites();
      artistsSnapshotRef.current = getFavoriteArtists();
      albumsSnapshotRef.current = getFavoriteAlbums();

      // Listen for cross-tab localStorage changes
      const handleStorage = (event: StorageEvent) => {
        const watchedKeys = [
          STORAGE_KEY,
          PERSONALIZATION_STORAGE_KEYS.favoriteArtists,
          PERSONALIZATION_STORAGE_KEYS.favoriteAlbums,
        ];
        if (event.key && watchedKeys.includes(event.key)) {
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

  const getSnapshot = useCallback(() => snapshotRef.current, []);
  const getArtistsSnapshot = useCallback(() => artistsSnapshotRef.current, []);
  const getAlbumsSnapshot = useCallback(() => albumsSnapshotRef.current, []);
  const getServerSnapshot = useCallback(() => emptyTracks, []);
  const getServerArtistsSnapshot = useCallback(() => emptyArtists, []);
  const getServerAlbumsSnapshot = useCallback(() => emptyAlbums, []);

  const favorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
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

  const addFavorite = useCallback(
    (track: ItunesTrack) => {
      addFav(track);
      notify();
    },
    [notify]
  );

  const removeFavorite = useCallback(
    (trackId: number) => {
      removeFav(trackId);
      notify();
    },
    [notify]
  );

  const isFavorite = useCallback(
    (trackId: number) => {
      return favorites.some((fav) => fav.trackId === trackId);
    },
    [favorites]
  );

  const addFavoriteArtist = useCallback(
    (artist: ItunesArtist) => {
      addArtistLib(artist);
      notify();
    },
    [notify]
  );

  const removeFavoriteArtist = useCallback(
    (artistId: number) => {
      removeArtistLib(artistId);
      notify();
    },
    [notify]
  );

  const isFavoriteArtist = useCallback(
    (artistId: number) => {
      return favoriteArtists.some((a) => a.artistId === artistId);
    },
    [favoriteArtists]
  );

  const addFavoriteAlbum = useCallback(
    (album: ItunesAlbum) => {
      addAlbumLib(album);
      notify();
    },
    [notify]
  );

  const removeFavoriteAlbum = useCallback(
    (collectionId: number) => {
      removeAlbumLib(collectionId);
      notify();
    },
    [notify]
  );

  const isFavoriteAlbum = useCallback(
    (collectionId: number) => {
      return favoriteAlbums.some((a) => a.collectionId === collectionId);
    },
    [favoriteAlbums]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        favoriteArtists,
        addFavoriteArtist,
        removeFavoriteArtist,
        isFavoriteArtist,
        favoriteAlbums,
        addFavoriteAlbum,
        removeFavoriteAlbum,
        isFavoriteAlbum,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
