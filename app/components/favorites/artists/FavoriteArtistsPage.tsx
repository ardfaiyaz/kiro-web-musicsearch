"use client";

import { useState, useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { useFavorites } from "@/app/components/FavoritesContext";
import type { ItunesArtist } from "@/lib/types";
import FavoriteArtistsHero from "./FavoriteArtistsHero";
import ArtistStatistics from "./ArtistStatistics";
import ArtistSearch from "./ArtistSearch";
import ArtistFilters, { type ArtistFilterState } from "./ArtistFilters";
import ArtistSorting, { type ArtistSortOption } from "./ArtistSorting";
import FavoriteArtistCard from "./FavoriteArtistCard";
import ArtistDetailsDrawer from "./ArtistDetailsDrawer";
import ArtistRecommendations from "./ArtistRecommendations";
import FavoriteArtistsSkeleton from "./FavoriteArtistsSkeleton";
import EmptyFavoriteArtists from "./EmptyFavoriteArtists";

function subscribeNoop() {
  return () => {};
}

export default function FavoriteArtistsPage() {
  const { favoriteArtists, removeFavoriteArtist } = useFavorites();
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<ArtistSortOption>("recent");
  const [filters, setFilters] = useState<ArtistFilterState>({
    genres: [],
    recentlyAdded: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ItunesArtist | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);

  const handleSearchFocus = useCallback(() => {
    searchInputRef.current
      ?.querySelector("input")
      ?.focus();
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleToggleSort = useCallback(() => {
    // Cycle through sort options
    setSort((prev) => {
      if (prev === "recent") return "alphabetical";
      if (prev === "alphabetical") return "genre";
      return "recent";
    });
  }, []);

  const handleShare = useCallback((artist: ItunesArtist) => {
    if (navigator.share) {
      navigator.share({
        title: artist.artistName,
        text: `Check out ${artist.artistName} on Music Search`,
        url: `/artist/${artist.artistId}`,
      }).catch(() => {
        // User cancelled or share failed silently
      });
    } else {
      navigator.clipboard.writeText(
        `${artist.artistName} - ${artist.primaryGenreName || "Music"}`
      ).catch(() => {
        // Clipboard not available
      });
    }
  }, []);

  // Filter and sort artists
  const processedArtists = useMemo(() => {
    let result = [...favoriteArtists];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.artistName.toLowerCase().includes(query) ||
          a.primaryGenreName?.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (filters.genres.length > 0) {
      result = result.filter((a) =>
        filters.genres.includes(a.primaryGenreName)
      );
    }

    // Sort
    switch (sort) {
      case "alphabetical":
        result.sort((a, b) => a.artistName.localeCompare(b.artistName));
        break;
      case "genre":
        result.sort((a, b) =>
          (a.primaryGenreName || "").localeCompare(b.primaryGenreName || "")
        );
        break;
      case "recent":
      default:
        // Keep original order (most recently added last in array = first displayed)
        result.reverse();
        break;
    }

    return result;
  }, [favoriteArtists, searchQuery, filters, sort]);

  // Show skeleton during hydration
  if (!hydrated) {
    return <FavoriteArtistsSkeleton />;
  }

  // Empty state
  if (favoriteArtists.length === 0) {
    return <EmptyFavoriteArtists />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <FavoriteArtistsHero
        artists={favoriteArtists}
        onSearchFocus={handleSearchFocus}
        onToggleFilters={handleToggleFilters}
        onToggleSort={handleToggleSort}
      />

      {/* Statistics */}
      <ArtistStatistics />

      {/* Search and Sort Bar */}
      <div className="flex flex-wrap items-center gap-3" ref={searchInputRef}>
        <ArtistSearch value={searchQuery} onChange={setSearchQuery} />
        <ArtistSorting value={sort} onChange={setSort} />
      </div>

      {/* Filters */}
      {showFilters && (
        <ArtistFilters
          artists={favoriteArtists}
          filters={filters}
          onChange={setFilters}
        />
      )}

      {/* Artist Grid */}
      {processedArtists.length > 0 ? (
        <section aria-label="Favorite artists grid">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {processedArtists.map((artist) => (
              <FavoriteArtistCard
                key={artist.artistId}
                artist={artist}
                onRemove={removeFavoriteArtist}
                onShare={handleShare}
                onClick={setSelectedArtist}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-muted">
            No artists match your search or filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilters({ genres: [], recentlyAdded: false });
            }}
            className="rounded-xl glass-medium px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Recommendations */}
      <ArtistRecommendations artists={favoriteArtists} />

      {/* Details Drawer */}
      <ArtistDetailsDrawer
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
    </div>
  );
}
