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

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <section aria-label="Your favorites">
          <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
            Your Favorites
          </h2>

          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <svg
                className="h-16 w-16 text-muted"
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
              <h3 className="text-xl font-semibold text-foreground">
                No favorites yet
              </h3>
              <p className="max-w-md text-muted">
                Search for music and click the heart icon on any track to add it
                to your favorites.
              </p>
              <Link
                href="/"
                className="mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Search for music
              </Link>
            </div>
          ) : (
            <TrackGrid tracks={favorites} />
          )}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}
