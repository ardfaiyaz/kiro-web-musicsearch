import { Suspense } from "react";
import SearchBar from "../components/SearchBar";
import SearchFilterChips from "../components/SearchFilterChips";
import SearchResultsLayout from "../components/SearchResultsLayout";
import AIDiscoveryPanel from "../components/AIDiscoveryPanel";
import ArtistGrid from "../components/ArtistGrid";
import AlbumGrid from "../components/AlbumGrid";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InfiniteScrollResults from "../components/InfiniteScrollResults";
import { searchTracks, searchArtists, searchAlbums } from "@/lib/itunes";
import { unifiedSearch } from "@/lib/music-service";
import { ItunesTrack } from "@/lib/types";
import { Search as SearchIcon, TrendingUp } from "lucide-react";
import FeelingLucky from "../components/FeelingLucky";
import SimilarArtistsSection from "../components/search/SimilarArtistsSection";

function filterByGenre(tracks: ItunesTrack[], genre: string): ItunesTrack[] {
  if (!genre) return tracks;
  return tracks.filter((t) =>
    t.primaryGenreName.toLowerCase().includes(genre.toLowerCase())
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

function filterByExplicit(
  tracks: ItunesTrack[],
  explicit: string
): ItunesTrack[] {
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

  if (
    tracks.length === 0 &&
    unified.artists.length === 0 &&
    unified.albums.length === 0
  ) {
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
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
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
  const unified = await unifiedSearch(query);
  let tracks = unified.tracks;

  if (entity) {
    const itunesTracks = await searchTracks(query, entity);
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

  const providerLabel =
    unified.spotifyArtist || unified.spotifyAlbum
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
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
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
const VALID_SORTS = [
  "relevance",
  "releaseDate",
  "artistName",
  "albumName",
] as const;

function isValidFilter(
  value: string
): value is (typeof VALID_FILTERS)[number] {
  return (VALID_FILTERS as readonly string[]).includes(value);
}

function isValidSort(value: string): value is (typeof VALID_SORTS)[number] {
  return (VALID_SORTS as readonly string[]).includes(value);
}

function SearchEmptyState() {
  const suggestions = [
    "Taylor Swift",
    "Drake",
    "BTS",
    "Billie Eilish",
    "The Weeknd",
  ];

  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface border border-border/50">
        <SearchIcon size={32} className="text-muted" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-foreground">
          Search for music
        </h2>
        <p className="max-w-sm text-muted">
          Find songs, artists, and albums from millions of tracks
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          <TrendingUp size={14} aria-hidden="true" />
          <span>Try searching for:</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((term) => (
            <span
              key={term}
              className="rounded-full border border-border/50 bg-surface px-3 py-1.5 text-sm text-foreground"
            >
              {term}
            </span>
          ))}
        </div>
      </div>
      <FeelingLucky className="mt-2" />
    </div>
  );
}

export default async function SearchPage({
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
  const {
    q,
    filter,
    sort,
    genre,
    year,
    explicit: explicitParam,
  } = await searchParams;
  const query = q?.trim() || "";
  const activeFilter = filter && isValidFilter(filter) ? filter : "all";
  const activeSort = sort && isValidSort(sort) ? sort : "relevance";
  const activeGenre = genre || "";
  const activeYear = year || "";
  const activeExplicit = explicitParam || "";

  // Detect "similar to [artist]" pattern
  const similarMatch = query.match(/^similar\s+to\s+(.+)$/i);
  const similarArtistName = similarMatch ? similarMatch[1].trim() : null;

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        <section className="flex justify-center py-8" aria-label="Search">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </section>

        {!query && <SearchEmptyState />}

        {query && (
          <>
            <section className="pb-4" aria-label="Filters">
              <Suspense fallback={null}>
                <SearchFilterChips />
              </Suspense>
            </section>

            {/* Similar To detection */}
            {similarArtistName && (
              <section className="mt-4">
                <Suspense
                  fallback={
                    <LoadingSpinner message={`Finding artists similar to ${similarArtistName}...`} />
                  }
                >
                  <SimilarArtistsSection artistName={similarArtistName} />
                </Suspense>
              </section>
            )}

            {activeFilter === "all" && (
              <section className="mt-6 pb-8">
                <Suspense
                  fallback={
                    <LoadingSpinner message="Searching across all categories..." />
                  }
                >
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
                <Suspense
                  fallback={
                    <LoadingSpinner message="Searching for songs..." />
                  }
                >
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
                <Suspense
                  fallback={
                    <LoadingSpinner message="Searching for artists..." />
                  }
                >
                  <ArtistResults query={query} />
                </Suspense>
              </section>
            )}

            {activeFilter === "album" && (
              <section className="mt-6 pb-8">
                <Suspense
                  fallback={
                    <LoadingSpinner message="Searching for albums..." />
                  }
                >
                  <AlbumResults query={query} />
                </Suspense>
              </section>
            )}

            <section className="pb-12">
              <Suspense fallback={null}>
                <AIDiscoveryPanel query={query} />
              </Suspense>
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
