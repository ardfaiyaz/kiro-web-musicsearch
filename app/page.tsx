import { Suspense } from "react";
import SearchBar from "./components/SearchBar";
import TrackGrid from "./components/TrackGrid";
import EmptyState from "./components/EmptyState";
import LoadingSpinner from "./components/LoadingSpinner";
import { searchTracks } from "@/lib/itunes";

async function SearchResults({ query }: { query: string }) {
  const tracks = await searchTracks(query);

  if (tracks.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <section aria-label="Search results">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Results for &ldquo;{query}&rdquo;
      </h2>
      <TrackGrid tracks={tracks} />
    </section>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground sm:text-xl">
              Music Search & Discovery
            </h1>
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
          <section className="mt-8">
            <Suspense fallback={<LoadingSpinner message="Searching for music..." />}>
              <SearchResults query={query} />
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
