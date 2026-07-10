"use client";

import Link from "next/link";
import { useFavorites } from "@/app/components/FavoritesContext";
import TrackGrid from "@/app/components/TrackGrid";
import Header from "@/app/components/Header";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <section aria-label="Your favorites">
          <header className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your Favorites
            </h2>
            <p className="mt-3 text-lg text-muted">
              {favorites.length > 0
                ? `${favorites.length} ${favorites.length === 1 ? "track" : "tracks"} saved`
                : "Your collection is empty"}
            </p>
          </header>

          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-foreground/5">
                <svg
                  className="h-12 w-12 text-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 8.25c0-3.15-2.7-5.25-5.437-5.25A5.5 5.5 0 0012 5.052 5.5 5.5 0 007.688 3C4.95 3 2.25 5.1 2.25 8.25c0 7.22 9.75 12.75 9.75 12.75s9.75-5.53 9.75-12.75z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                No favorites yet
              </h3>
              <p className="max-w-md text-muted">
                Search for music and click the heart icon on any track to add it
                to your favorites.
              </p>
              <Link
                href="/"
                className="cursor-pointer mt-4 rounded-2xl bg-foreground px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
              >
                Discover Music
              </Link>
            </div>
          ) : (
            <TrackGrid tracks={favorites} />
          )}
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}
