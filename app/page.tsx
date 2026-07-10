import { Suspense } from "react";
import SearchBar from "./components/SearchBar";
import SearchFilters from "./components/SearchFilters";
import ArtistGrid from "./components/ArtistGrid";
import AlbumGrid from "./components/AlbumGrid";
import EmptyState from "./components/EmptyState";
import LoadingSpinner from "./components/LoadingSpinner";
import Header from "./components/Header";
import InfiniteScrollResults from "./components/InfiniteScrollResults";
import { searchTracks, searchArtists, searchAlbums } from "@/lib/itunes";
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
  let tracks = await searchTracks(query, entity);
  tracks = filterByGenre(tracks, genre);
  tracks = filterByYear(tracks, year);
  tracks = filterByExplicit(tracks, explicit);
  const sortedTracks = sortTracks(tracks, sort);

  if (sortedTracks.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <section aria-label="Search results" className="animate-fade-in">
      <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
        Results for &ldquo;{query}&rdquo;
      </h2>
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

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        {!query && (
          <section
            className="flex flex-col items-center justify-center gap-8 py-24 text-center sm:py-32 lg:py-40"
            aria-label="Hero"
          >
            <div className="animate-slide-up">
              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Discover Music
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted sm:text-xl">
                Search millions of songs, explore artists, and find your next
                favorite track.
              </p>
            </div>
            <div className="w-full max-w-2xl animate-fade-in">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-muted animate-fade-in">
              <span>Try:</span>
              <span className="rounded-full border border-border px-3 py-1 transition-premium hover:border-foreground/30 hover:text-foreground">
                Taylor Swift
              </span>
              <span className="rounded-full border border-border px-3 py-1 transition-premium hover:border-foreground/30 hover:text-foreground">
                The Weeknd
              </span>
              <span className="rounded-full border border-border px-3 py-1 transition-premium hover:border-foreground/30 hover:text-foreground">
                Kendrick Lamar
              </span>
            </div>
          </section>
        )}

        {query && (
          <section className="flex justify-center py-8" aria-label="Search">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </section>
        )}

        {query && (
          <section className="pb-4" aria-label="Filters">
            <Suspense fallback={null}>
              <SearchFilters />
            </Suspense>
          </section>
        )}

        {query && activeFilter === "artist" && (
          <section className="mt-6 pb-12">
            <Suspense fallback={<LoadingSpinner message="Searching for artists..." />}>
              <ArtistResults query={query} />
            </Suspense>
          </section>
        )}

        {query && activeFilter === "album" && (
          <section className="mt-6 pb-12">
            <Suspense fallback={<LoadingSpinner message="Searching for albums..." />}>
              <AlbumResults query={query} />
            </Suspense>
          </section>
        )}

        {query && (activeFilter === "all" || activeFilter === "song") && (
          <section className="mt-6 pb-12">
            <Suspense fallback={<LoadingSpinner message="Searching for music..." />}>
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
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}
