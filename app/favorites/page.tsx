"use client";

import Link from "next/link";
import { useFavorites } from "@/app/components/FavoritesContext";
import TrackGrid from "@/app/components/TrackGrid";
import Header from "@/app/components/Header";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground sm:text-xl">
              <Link href="/" className="cursor-pointer hover:text-accent transition-colors">
                Music Search &amp; Discovery
              </Link>
            </h1>
            <Link
              href="/favorites"
              className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-400"
              aria-label="Favorites"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </Link>
          </nav>
        </div>
      </header>

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
                className="cursor-pointer mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
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
