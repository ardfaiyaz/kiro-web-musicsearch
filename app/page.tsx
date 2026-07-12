import { Suspense } from "react";
import SearchBar from "./components/SearchBar";
import SearchFilterChips from "./components/SearchFilterChips";
import SearchResultsLayout from "./components/SearchResultsLayout";
import AIDiscoveryPanel from "./components/AIDiscoveryPanel";
import ArtistGrid from "./components/ArtistGrid";
import AlbumGrid from "./components/AlbumGrid";
import EmptyState from "./components/EmptyState";
import LoadingSpinner from "./components/LoadingSpinner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import InfiniteScrollResults from "./components/InfiniteScrollResults";
import HeroSection from "./components/HeroSection";
import FeaturedArtistsCarousel from "./components/FeaturedArtistsCarousel";
import TrendingSection from "./components/TrendingSection";
import EditorialPicks from "./components/EditorialPicks";
import NewReleasesGrid from "./components/NewReleasesGrid";
import PersonalizedSection from "./components/PersonalizedSection";
import ContinueListening from "./components/player/ContinueListening";
import { searchTracks, searchArtists, searchAlbums } from "@/lib/itunes";
import { unifiedSearch } from "@/lib/music-service";
import { getTrendingSongs, getNewReleases } from "@/lib/discovery";
import { getRecommendationsByMood } from "@/lib/ai-discovery";
import { ItunesTrack } from "@/lib/types";

function filterByGenre(tracks: ItunesTrack[], genre: string): ItunesTrack[] {
  if (!genre) return tracks;
  return tracks.filter(
    (t) => t.primaryGenreName.toLowerCase().includes(genre.toLowerCase())
  );
}

function filterByYear(tracks: ItunesTrack[], year: string): ItunesTrack[] {
  if (!year) return tracks;

  return tracks.filter((t) => {
    const releaseYear = new Date(t.releaseDate).getFullYear();
    switch (year) {
      case "2024":
        return releaseYear === 2024;
      case "2023":
        return releaseYear === 2023;
      case "2022":
        return releaseYear === 2022;
      case "2020s":
        return releaseYear >= 2020 && releaseYear <= 2021;
      case "2010s":
        return releaseYear >= 2010 && releaseYear <= 2019;
      case "2000s":
        return releaseYear >= 2000 && releaseYear <= 2009;
      case "1990s":
        return releaseYear >= 1990 && releaseYear <= 1999;
      case "1980s":
        return releaseYear >= 1980 && releaseYear <= 1989;
      case "older":
        return releaseYear < 1980;
      default:
        return true;
    }
  });
}

function filterByExplicit(tracks: ItunesTrack[], explicit: string): ItunesTrack[] {
  if (!explicit) return tracks;
  if (explicit === "hide") {
    return tracks.filter((t) => t.trackExplicitness !== "explicit");
  }
  if (explicit === "only") {
    return tracks.filter((t) => t.trackExplicitness === "explicit");
  }
  return tracks;
}

function sortTracks(tracks: ItunesTrack[], sort: string): ItunesTrack[] {
  if (sort === "releaseDate") {
    return [...tracks].sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  }
  if (sort === "artistName") {
    return [...tracks].sort((a, b) =>
      a.artistName.localeCompare(b.artistName)
    );
  }
  if (sort === "albumName") {
    return [...tracks].sort((a, b) =>
      a.collectionName.localeCompare(b.collectionName)
    );
  }
  return tracks;
}

async function CategorizedResults({
  query,
  sort,
  genre,
  year,
  explicit,
}: {
  query: string;
  sort: string;
  genre: string;
  year: string;
  explicit: string;
}) {
  const unified = await unifiedSearch(query);
  let tracks = unified.tracks;

  tracks = filterByGenre(tracks, genre);
  tracks = filterByYear(tracks, year);
  tracks = filterByExplicit(tracks, explicit);
  tracks = sortTracks(tracks, sort);

  if (tracks.length === 0 && unified.artists.length === 0 && unified.albums.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <section aria-label="Search results" className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          Results for &ldquo;{query}&rdquo;
        </h2>
        {(unified.spotifyArtist || unified.spotifyAlbum) && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Multi-source
          </span>
        )}
      </div>
      <SearchResultsLayout
        tracks={tracks}
        artists={unified.artists}
        albums={unified.albums}
        spotifyArtist={unified.spotifyArtist}
        query={query}
      />
    </section>
  );
}

async function TrackResults({
  query,
  filter,
  sort,
  genre,
  year,
  explicit,
}: {
  query: string;
  filter: string;
  sort: string;
  genre: string;
  year: string;
  explicit: string;
}) {
  const entity = filter === "song" ? "song" : undefined;

  // Use unified search to combine results from multiple providers
  const unified = await unifiedSearch(query);
  let tracks = unified.tracks;

  // If entity is specified, also do a targeted iTunes search to ensure complete results
  if (entity) {
    const itunesTracks = await searchTracks(query, entity);
    // Merge unique tracks from iTunes-specific search
    const existingIds = new Set(tracks.map((t) => t.trackId));
    for (const track of itunesTracks) {
      if (!existingIds.has(track.trackId)) {
        tracks.push(track);
        existingIds.add(track.trackId);
      }
    }
  }

  tracks = filterByGenre(tracks, genre);
  tracks = filterByYear(tracks, year);
  tracks = filterByExplicit(tracks, explicit);
  const sortedTracks = sortTracks(tracks, sort);

  if (sortedTracks.length === 0) {
    return <EmptyState query={query} />;
  }

  const providerLabel = unified.spotifyArtist || unified.spotifyAlbum
    ? "Results from multiple sources"
    : "Results";

  return (
    <section aria-label="Search results" className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          {providerLabel} for &ldquo;{query}&rdquo;
        </h2>
        {(unified.spotifyArtist || unified.spotifyAlbum) && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Multi-source
          </span>
        )}
      </div>
      <InfiniteScrollResults
        initialTracks={sortedTracks}
        query={query}
        entity={entity}
        genre={genre}
        year={year}
        explicit={explicit}
      />
    </section>
  );
}

async function ArtistResults({ query }: { query: string }) {
  const artists = await searchArtists(query);

  if (artists.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <section aria-label="Artist search results" className="animate-fade-in">
      <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
        Artists matching &ldquo;{query}&rdquo;
      </h2>
      <ArtistGrid artists={artists} />
    </section>
  );
}

async function AlbumResults({ query }: { query: string }) {
  const albums = await searchAlbums(query);

  if (albums.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <section aria-label="Album search results" className="animate-fade-in">
      <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
        Albums matching &ldquo;{query}&rdquo;
      </h2>
      <AlbumGrid albums={albums} />
    </section>
  );
}

const VALID_FILTERS = ["all", "song", "artist", "album"] as const;
const VALID_SORTS = ["relevance", "releaseDate", "artistName", "albumName"] as const;

function isValidFilter(value: string): value is (typeof VALID_FILTERS)[number] {
  return (VALID_FILTERS as readonly string[]).includes(value);
}

function isValidSort(value: string): value is (typeof VALID_SORTS)[number] {
  return (VALID_SORTS as readonly string[]).includes(value);
}

/* Skeleton loading shimmer for editorial sections */
function EditorialSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading content">
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
  } catch (error) {
    console.error("Failed to fetch editorial data:", error);
    return null;
  }
}

function EditorialFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
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
      {newReleases.length > 0 && (
        <NewReleasesGrid releases={newReleases} />
      )}

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    sort?: string;
    genre?: string;
    year?: string;
    explicit?: string;
  }>;
}) {
  const { q, filter, sort, genre, year, explicit: explicitParam } = await searchParams;
  const query = q?.trim() || "";
  const activeFilter = filter && isValidFilter(filter) ? filter : "all";
  const activeSort = sort && isValidSort(sort) ? sort : "relevance";
  const activeGenre = genre || "";
  const activeYear = year || "";
  const activeExplicit = explicitParam || "";

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      {/* Editorial homepage when no search query */}
      {!query && (
        <>
          <ContinueListening />
          <Suspense fallback={<EditorialSkeleton />}>
            <EditorialHomepage />
          </Suspense>
        </>
      )}

      {/* Search experience when query is present */}
      {query && (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
          <section className="flex justify-center py-8" aria-label="Search">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </section>

          <section className="pb-4" aria-label="Filters">
            <Suspense fallback={null}>
              <SearchFilterChips />
            </Suspense>
          </section>

          {activeFilter === "all" && (
            <section className="mt-6 pb-8">
              <Suspense fallback={<LoadingSpinner message="Searching across all categories..." />}>
                <CategorizedResults
                  query={query}
                  sort={activeSort}
                  genre={activeGenre}
                  year={activeYear}
                  explicit={activeExplicit}
                />
              </Suspense>
            </section>
          )}

          {activeFilter === "song" && (
            <section className="mt-6 pb-8">
              <Suspense fallback={<LoadingSpinner message="Searching for songs..." />}>
                <TrackResults
                  query={query}
                  filter={activeFilter}
                  sort={activeSort}
                  genre={activeGenre}
                  year={activeYear}
                  explicit={activeExplicit}
                />
              </Suspense>
            </section>
          )}

          {activeFilter === "artist" && (
            <section className="mt-6 pb-8">
              <Suspense fallback={<LoadingSpinner message="Searching for artists..." />}>
                <ArtistResults query={query} />
              </Suspense>
            </section>
          )}

          {activeFilter === "album" && (
            <section className="mt-6 pb-8">
              <Suspense fallback={<LoadingSpinner message="Searching for albums..." />}>
                <AlbumResults query={query} />
              </Suspense>
            </section>
          )}

          {/* AI Discovery Panel */}
          <section className="pb-12">
            <Suspense fallback={null}>
              <AIDiscoveryPanel query={query} />
            </Suspense>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}
