"use client";

import { useMemo, useSyncExternalStore } from "react";
import { usePersonalization } from "@/app/components/PersonalizationContext";
import { useFavorites } from "@/app/components/FavoritesContext";
import InsightsHero from "./InsightsHero";
import ListeningSummary from "./ListeningSummary";
import ActivityOverview from "./ActivityOverview";
import TopSongsChart from "./TopSongsChart";
import TopArtistsChart from "./TopArtistsChart";
import TopAlbumsChart from "./TopAlbumsChart";
import GenreAnalytics from "./GenreAnalytics";
import ListeningHeatmap from "./ListeningHeatmap";
import ListeningTimeline from "./ListeningTimeline";
import TasteEvolution from "./TasteEvolution";
import Achievements from "./Achievements";
import DiscoveryAnalytics from "./DiscoveryAnalytics";
import InsightsSkeleton from "./InsightsSkeleton";
import EmptyInsights from "./EmptyInsights";

function subscribeNoop() {
  return () => {};
}

export default function MusicInsightsPage() {
  const { listeningHistory } = usePersonalization();
  const { favorites, favoriteArtists, favoriteAlbums } = useFavorites();
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  // Memoization key: history length and last entry timestamp
  const historyKey = useMemo(
    () => ({
      length: listeningHistory.length,
      lastTimestamp:
        listeningHistory.length > 0 ? listeningHistory[0].playedAt : 0,
    }),
    [listeningHistory]
  );

  // Memoized history copy for stable reference
  const history = useMemo(
    () => listeningHistory,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [historyKey.length, historyKey.lastTimestamp]
  );

  if (!hydrated) {
    return <InsightsSkeleton />;
  }

  if (listeningHistory.length === 0) {
    return <EmptyInsights />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <InsightsHero history={history} />

      <ListeningSummary history={history} />

      <ActivityOverview history={history} />

      {/* Rankings - responsive 2-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TopSongsChart history={history} />
        <TopArtistsChart history={history} />
      </div>

      <TopAlbumsChart history={history} />

      <GenreAnalytics history={history} />

      <ListeningHeatmap history={history} />

      <ListeningTimeline history={history} />

      <TasteEvolution history={history} />

      <DiscoveryAnalytics history={history} />

      <Achievements
        history={history}
        favCount={favorites.length}
        artistCount={favoriteArtists.length}
        albumCount={favoriteAlbums.length}
      />
    </div>
  );
}
