import { Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import FeaturedArtistsCarousel from "./components/FeaturedArtistsCarousel";
import TrendingSection from "./components/TrendingSection";
import EditorialPicks from "./components/EditorialPicks";
import NewReleasesGrid from "./components/NewReleasesGrid";
import PersonalizedSection from "./components/PersonalizedSection";
import ContinueListening from "./components/player/ContinueListening";
import RecentlyViewed from "./components/RecentlyViewed";
import DailyDiscovery from "./components/discover/DailyDiscovery";
import { getTrendingSongs, getNewReleases } from "@/lib/discovery";
import { getRecommendationsByMood } from "@/lib/ai-discovery";

/* Skeleton loading shimmer for editorial sections */
function EditorialSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading content"
    >
      {/* Hero skeleton */}
      <div className="mb-12 flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:gap-12">
        <div className="h-56 w-56 rounded-2xl shimmer-wave sm:h-64 sm:w-64" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 rounded shimmer-wave" />
          <div className="h-10 w-64 rounded shimmer-wave" />
          <div className="h-5 w-40 rounded shimmer-wave" />
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square rounded-2xl shimmer-wave" />
            <div className="h-4 w-3/4 rounded shimmer-wave" />
            <div className="h-3 w-1/2 rounded shimmer-wave" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface EditorialData {
  trendingSongs: Awaited<ReturnType<typeof getTrendingSongs>>;
  newReleases: Awaited<ReturnType<typeof getNewReleases>>;
  moodRecs: Awaited<ReturnType<typeof getRecommendationsByMood>>;
}

async function fetchEditorialData(): Promise<EditorialData | null> {
  try {
    const [trendingSongs, newReleases, moodRecs] = await Promise.all([
      getTrendingSongs(),
      getNewReleases(),
      getRecommendationsByMood("chill"),
    ]);
    return { trendingSongs, newReleases, moodRecs };
  } catch {
    return null;
  }
}

function EditorialFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
          <svg
            className="h-10 w-10 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Discover Music
        </h2>
        <p className="max-w-md text-muted">
          Use the search bar above to find songs, artists, and albums. Our music
          catalog is powered by iTunes and requires no configuration.
        </p>
      </div>

      {/* Editorial Picks still renders without external data */}
      <div className="mt-12">
        <EditorialPicks />
      </div>
    </div>
  );
}

async function EditorialHomepage() {
  const data = await fetchEditorialData();

  if (!data) {
    return <EditorialFallback />;
  }

  const { trendingSongs, newReleases, moodRecs } = data;

  // If all data sources returned empty, show fallback
  if (
    trendingSongs.length === 0 &&
    newReleases.length === 0 &&
    moodRecs.tracks.length === 0
  ) {
    return <EditorialFallback />;
  }

  const heroSong = trendingSongs[0];

  // Extract unique featured artists from trending songs
  const featuredArtists = Array.from(
    new Map(
      trendingSongs.map((song) => [song.artistName, song])
    ).values()
  ).slice(0, 12);

  return (
    <>
      {/* Hero Section */}
      {heroSong && <HeroSection featured={heroSong} />}

      {/* Featured Artists Carousel */}
      {featuredArtists.length > 0 && (
        <FeaturedArtistsCarousel artists={featuredArtists} />
      )}

      {/* Trending Section */}
      {trendingSongs.length > 0 && (
        <TrendingSection tracks={trendingSongs} />
      )}

      {/* Editorial Picks */}
      <EditorialPicks />

      {/* New Releases Grid */}
      {newReleases.length > 0 && <NewReleasesGrid releases={newReleases} />}

      {/* Personalized Recommendations */}
      {moodRecs.tracks.length > 0 && (
        <PersonalizedSection
          initialTracks={moodRecs.tracks}
          initialMood="chill"
        />
      )}
    </>
  );
}

export default async function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <ContinueListening />
      <RecentlyViewed />

      {/* Daily Discovery Feed */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <DailyDiscovery />
      </div>

      <Suspense fallback={<EditorialSkeleton />}>
        <EditorialHomepage />
      </Suspense>

      <Footer />
    </div>
  );
}
