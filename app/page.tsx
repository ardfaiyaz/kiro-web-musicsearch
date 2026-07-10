import { Suspense } from "react";
import Link from "next/link";
import SearchBar from "./components/SearchBar";
import SearchFilters from "./components/SearchFilters";
import TrackGrid from "./components/TrackGrid";
import ArtistGrid from "./components/ArtistGrid";
import AlbumGrid from "./components/AlbumGrid";
import EmptyState from "./components/EmptyState";
import LoadingSpinner from "./components/LoadingSpinner";
import { searchTracks, searchArtists, searchAlbums } from "@/lib/itunes";
import { ItunesTrack } from "@/lib/types";

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
  return tracks;
}

async function TrackResults({
  query,
  filter,
  sort,
}: {
  query: string;
  filter: string;
  sort: string;
}) {
  const entity = filter === "song" ? "song" : undefined;
  const tracks = await searchTracks(query, entity);
  const sortedTracks = sortTracks(tracks, sort);

  if (sortedTracks.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <section aria-label="Search results">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Results for &ldquo;{query}&rdquo;
      </h2>
      <TrackGrid tracks={sortedTracks} />
    </section>
  );
}

async function ArtistResults({ query }: { query: string }) {
  const artists = await searchArtists(query);

  if (artists.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <section aria-label="Artist search results">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
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
    <section aria-label="Album search results">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Albums matching &ldquo;{query}&rdquo;
      </h2>
      <AlbumGrid albums={albums} />
    </section>
  );
}

const VALID_FILTERS = ["all", "song", "artist", "album"] as const;
const VALID_SORTS = ["relevance", "releaseDate", "artistName"] as const;

function isValidFilter(value: string): value is (typeof VALID_FILTERS)[number] {
  return (VALID_FILTERS as readonly string[]).includes(value);
}

function isValidSort(value: string): value is (typeof VALID_SORTS)[number] {
  return (VALID_SORTS as readonly string[]).includes(value);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; sort?: string }>;
}) {
  const { q, filter, sort } = await searchParams;
  const query = q?.trim() || "";
  const activeFilter = filter && isValidFilter(filter) ? filter : "all";
  const activeSort = sort && isValidSort(sort) ? sort : "relevance";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground sm:text-xl">
              Music Search &amp; Discovery
            </h1>
            <Link
              href="/favorites"
              className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-red-500"
              aria-label="Favorites"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 8.25c0-3.15-2.7-5.25-5.437-5.25A5.5 5.5 0 0012 5.052 5.5 5.5 0 007.688 3C4.95 3 2.25 5.1 2.25 8.25c0 7.22 9.75 12.75 9.75 12.75s9.75-5.53 9.75-12.75z"
                />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {!query && (
          <section className="flex flex-col items-center justify-center gap-6 py-16 text-center" aria-label="Hero">
            <svg
              className="h-16 w-16 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Discover Your Next Favorite Song
            </h2>
            <p className="max-w-lg text-lg text-muted">
              Search millions of songs, artists, and albums. Listen to previews
              and explore music by your favorite artists.
            </p>
          </section>
        )}

        <section className="flex justify-center py-4" aria-label="Search">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </section>

        {query && (
          <section className="py-4" aria-label="Filters">
            <Suspense fallback={null}>
              <SearchFilters />
            </Suspense>
          </section>
        )}

        {query && activeFilter === "artist" && (
          <section className="mt-8">
            <Suspense fallback={<LoadingSpinner message="Searching for artists..." />}>
              <ArtistResults query={query} />
            </Suspense>
          </section>
        )}

        {query && activeFilter === "album" && (
          <section className="mt-8">
            <Suspense fallback={<LoadingSpinner message="Searching for albums..." />}>
              <AlbumResults query={query} />
            </Suspense>
          </section>
        )}

        {query && (activeFilter === "all" || activeFilter === "song") && (
          <section className="mt-8">
            <Suspense fallback={<LoadingSpinner message="Searching for music..." />}>
              <TrackResults query={query} filter={activeFilter} sort={activeSort} />
            </Suspense>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}
