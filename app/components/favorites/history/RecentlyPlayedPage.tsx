"use client";

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { usePersonalization } from "@/app/components/PersonalizationContext";
import type { HistoryEntry } from "@/lib/personalization";
import RecentlyPlayedHero from "./RecentlyPlayedHero";
import ContinueListening from "./ContinueListening";
import ListeningTimeline from "./ListeningTimeline";
import ListeningSession from "./ListeningSession";
import RecentlyPlayedSongs from "./RecentlyPlayedSongs";
import RecentlyPlayedAlbums from "./RecentlyPlayedAlbums";
import RecentlyPlayedArtists from "./RecentlyPlayedArtists";
import HistorySearch from "./HistorySearch";
import HistoryFilters, { type HistoryFilterState } from "./HistoryFilters";
import HistoryStatistics from "./HistoryStatistics";
import ListeningInsights from "./ListeningInsights";
import HistoryRecommendations from "./HistoryRecommendations";
import RecentlyPlayedSkeleton from "./RecentlyPlayedSkeleton";
import EmptyHistory from "./EmptyHistory";

function subscribeNoop() {
  return () => {};
}

function getClientNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

export default function RecentlyPlayedPage() {
  const { listeningHistory, removeHistoryEntry } = usePersonalization();
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<HistoryFilterState>({
    time: "all",
    completion: "all",
    genre: "",
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFiltersChange = useCallback((newFilters: HistoryFilterState) => {
    setFilters(newFilters);
  }, []);

  const handleDismiss = useCallback(
    (trackId: number, playedAt: number) => {
      removeHistoryEntry(trackId, playedAt);
    },
    [removeHistoryEntry]
  );

  const handleRemove = useCallback(
    (trackId: number, playedAt: number) => {
      removeHistoryEntry(trackId, playedAt);
    },
    [removeHistoryEntry]
  );

  // Apply search and filters
  const filteredHistory = useMemo((): HistoryEntry[] => {
    let result = [...listeningHistory];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.trackName.toLowerCase().includes(query) ||
          entry.artistName.toLowerCase().includes(query) ||
          entry.albumName.toLowerCase().includes(query) ||
          entry.primaryGenreName.toLowerCase().includes(query)
      );
    }

    // Time filter
    if (filters.time !== "all" && now > 0) {
      let cutoff = 0;
      if (filters.time === "today") {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        cutoff = today.getTime();
      } else if (filters.time === "week") {
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
      } else if (filters.time === "month") {
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
      }
      result = result.filter((entry) => entry.playedAt >= cutoff);
    }

    // Completion filter
    if (filters.completion === "completed") {
      result = result.filter((entry) => entry.completed);
    } else if (filters.completion === "incomplete") {
      result = result.filter((entry) => !entry.completed);
    }

    // Genre filter
    if (filters.genre) {
      result = result.filter(
        (entry) => entry.primaryGenreName === filters.genre
      );
    }

    return result;
  }, [listeningHistory, searchQuery, filters, now]);

  if (!hydrated) {
    return <RecentlyPlayedSkeleton />;
  }

  if (listeningHistory.length === 0) {
    return <EmptyHistory />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <RecentlyPlayedHero history={listeningHistory} />

      <ContinueListening history={listeningHistory} onDismiss={handleDismiss} />

      <HistoryStatistics history={listeningHistory} />

      {/* Search and Filters */}
      <div className="space-y-3">
        <HistorySearch onSearch={handleSearch} />
        <HistoryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          history={listeningHistory}
        />
      </div>

      <ListeningInsights history={filteredHistory} />

      {/* Main content area - responsive layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ListeningTimeline history={filteredHistory} />
          <RecentlyPlayedSongs history={filteredHistory} onRemove={handleRemove} />
        </div>
        <aside className="space-y-8">
          <ListeningSession history={filteredHistory} />
          <RecentlyPlayedAlbums history={filteredHistory} />
          <RecentlyPlayedArtists history={filteredHistory} />
        </aside>
      </div>

      <HistoryRecommendations history={listeningHistory} />
    </div>
  );
}
