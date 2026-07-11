"use client";

import { useState, useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { useFavorites } from "@/app/components/FavoritesContext";
import type { ItunesAlbum } from "@/lib/types";
import FavoriteAlbumsHero from "./FavoriteAlbumsHero";
import AlbumStatistics from "./AlbumStatistics";
import AlbumSearch from "./AlbumSearch";
import AlbumFilters, { type AlbumFilterState } from "./AlbumFilters";
import AlbumSorting, { type AlbumSortOption } from "./AlbumSorting";
import AlbumViewSwitcher, {
  type AlbumViewMode,
  getStoredViewMode,
} from "./AlbumViewSwitcher";
import AlbumGallery from "./AlbumGallery";
import AlbumShelf from "./AlbumShelf";
import AlbumCompact from "./AlbumCompact";
import AlbumList from "./AlbumList";
import AlbumDetailsDrawer from "./AlbumDetailsDrawer";
import AlbumRecommendations from "./AlbumRecommendations";
import FavoriteAlbumsSkeleton from "./FavoriteAlbumsSkeleton";
import EmptyFavoriteAlbums from "./EmptyFavoriteAlbums";

function subscribeNoop() {
  return () => {};
}

function getDecade(releaseDate: string): string {
  const year = new Date(releaseDate).getFullYear();
  if (isNaN(year)) return "Unknown";
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

export default function FavoriteAlbumsPage() {
  const { favoriteAlbums, removeFavoriteAlbum } = useFavorites();
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<AlbumSortOption>("recent");
  const [filters, setFilters] = useState<AlbumFilterState>({
    genres: [],
    artists: [],
    decades: [],
    recentlyAdded: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<AlbumViewMode>(() => {
    if (typeof window === "undefined") return "gallery";
    return getStoredViewMode();
  });
  const [selectedAlbum, setSelectedAlbum] = useState<ItunesAlbum | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);

  const handleSearchFocus = useCallback(() => {
    searchInputRef.current?.querySelector("input")?.focus();
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleToggleSort = useCallback(() => {
    setSort((prev) => {
      if (prev === "recent") return "alphabetical";
      if (prev === "alphabetical") return "artist";
      if (prev === "artist") return "releaseDate";
      if (prev === "releaseDate") return "trackCount";
      return "recent";
    });
  }, []);

  const handleShare = useCallback((album: ItunesAlbum) => {
    if (navigator.share) {
      navigator
        .share({
          title: album.collectionName,
          text: `Check out ${album.collectionName} by ${album.artistName}`,
          url: `/album/${album.collectionId}`,
        })
        .catch(() => {
          // User cancelled or share failed silently
        });
    } else {
      navigator.clipboard
        .writeText(
          `${album.collectionName} - ${album.artistName}`
        )
        .catch(() => {
          // Clipboard not available
        });
    }
  }, []);

  // Filter and sort albums
  const processedAlbums = useMemo(() => {
    let result = [...favoriteAlbums];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.collectionName.toLowerCase().includes(query) ||
          a.artistName.toLowerCase().includes(query) ||
          a.primaryGenreName?.toLowerCase().includes(query) ||
          (a.releaseDate && new Date(a.releaseDate).getFullYear().toString().includes(query))
      );
    }

    // Genre filter
    if (filters.genres.length > 0) {
      result = result.filter((a) => filters.genres.includes(a.primaryGenreName));
    }

    // Artist filter
    if (filters.artists.length > 0) {
      result = result.filter((a) => filters.artists.includes(a.artistName));
    }

    // Decade filter
    if (filters.decades.length > 0) {
      result = result.filter((a) => filters.decades.includes(getDecade(a.releaseDate)));
    }

    // Sort
    switch (sort) {
      case "alphabetical":
        result.sort((a, b) => a.collectionName.localeCompare(b.collectionName));
        break;
      case "artist":
        result.sort((a, b) => a.artistName.localeCompare(b.artistName));
        break;
      case "releaseDate":
        result.sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
        break;
      case "trackCount":
        result.sort((a, b) => (b.trackCount || 0) - (a.trackCount || 0));
        break;
      case "recent":
      default:
        // Most recently added first (last in array = most recent)
        result.reverse();
        break;
    }

    return result;
  }, [favoriteAlbums, searchQuery, filters, sort]);

  // Show skeleton during hydration
  if (!hydrated) {
    return <FavoriteAlbumsSkeleton />;
  }

  // Empty state
  if (favoriteAlbums.length === 0) {
    return <EmptyFavoriteAlbums />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <FavoriteAlbumsHero
        albums={favoriteAlbums}
        onSearchFocus={handleSearchFocus}
        onToggleFilters={handleToggleFilters}
        onToggleSort={handleToggleSort}
      />

      {/* Statistics */}
      <AlbumStatistics />

      {/* Search, View Switcher, Sort Bar */}
      <div className="flex flex-wrap items-center gap-3" ref={searchInputRef}>
        <AlbumSearch value={searchQuery} onChange={setSearchQuery} />
        <AlbumViewSwitcher value={viewMode} onChange={setViewMode} />
        <AlbumSorting value={sort} onChange={setSort} />
      </div>

      {/* Filters */}
      {showFilters && (
        <AlbumFilters
          albums={favoriteAlbums}
          filters={filters}
          onChange={setFilters}
        />
      )}

      {/* Album Views */}
      {processedAlbums.length > 0 ? (
        <>
          {viewMode === "gallery" && (
            <AlbumGallery
              albums={processedAlbums}
              onRemove={removeFavoriteAlbum}
              onShare={handleShare}
              onClick={setSelectedAlbum}
            />
          )}
          {viewMode === "shelf" && (
            <AlbumShelf albums={processedAlbums} onClick={setSelectedAlbum} />
          )}
          {viewMode === "compact" && (
            <AlbumCompact
              albums={processedAlbums}
              onRemove={removeFavoriteAlbum}
              onShare={handleShare}
              onClick={setSelectedAlbum}
            />
          )}
          {viewMode === "list" && (
            <AlbumList
              albums={processedAlbums}
              onRemove={removeFavoriteAlbum}
              onShare={handleShare}
              onClick={setSelectedAlbum}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-muted">
            No albums match your search or filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilters({ genres: [], artists: [], decades: [], recentlyAdded: false });
            }}
            className="rounded-xl glass-medium px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Recommendations */}
      <AlbumRecommendations />

      {/* Details Drawer */}
      <AlbumDetailsDrawer
        album={selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
      />
    </div>
  );
}
