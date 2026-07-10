"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { ItunesTrack } from "@/lib/types";
import {
  getFavorites,
  addFavorite as addFav,
  removeFavorite as removeFav,
} from "@/lib/favorites";

interface FavoritesContextType {
  favorites: ItunesTrack[];
  addFavorite: (track: ItunesTrack) => void;
  removeFavorite: (trackId: number) => void;
  isFavorite: (trackId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const emptyArray: ItunesTrack[] = [];

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<() => void>());
  const snapshotRef = useRef<ItunesTrack[]>(emptyArray);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const current = getFavorites();
    if (JSON.stringify(current) !== JSON.stringify(snapshotRef.current)) {
      snapshotRef.current = current;
    }
    return snapshotRef.current;
  }, []);

  const getServerSnapshot = useCallback(() => emptyArray, []);

  const favorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const notify = useCallback(() => {
    snapshotRef.current = getFavorites();
    listenersRef.current.forEach((listener) => listener());
  }, []);

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

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
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
