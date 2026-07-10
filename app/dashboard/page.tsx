"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { useFavorites } from "@/app/components/FavoritesContext";
import { usePersonalization } from "@/app/components/PersonalizationContext";
import { getRecentSearches } from "@/lib/recent-searches";

function getMostCommonGenre(
  genres: string[]
): string | null {
  if (genres.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const genre of genres) {
    counts[genre] = (counts[genre] || 0) + 1;
  }
  let maxGenre = "";
  let maxCount = 0;
  for (const [genre, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxGenre = genre;
    }
  }
  return maxGenre || null;
}

function getMostPlayedArtist(
  artists: string[]
): string | null {
  if (artists.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const artist of artists) {
    counts[artist] = (counts[artist] || 0) + 1;
  }
  let maxArtist = "";
  let maxCount = 0;
  for (const [artist, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxArtist = artist;
    }
  }
  return maxArtist || null;
}

export default function DashboardPage() {
  const { favorites } = useFavorites();
  const { recentlyPlayed, favoriteArtists, favoriteAlbums } =
    usePersonalization();

  const recentSearches = getRecentSearches();

  // Compute analytics
  const totalFavoriteSongs = favorites.length;
  const totalFavoriteArtists = favoriteArtists.length;
  const totalFavoriteAlbums = favoriteAlbums.length;

  const allGenres = [
    ...favorites.map((t) => t.primaryGenreName),
    ...favoriteAlbums.map((a) => a.primaryGenreName),
  ];
  const favoriteGenre = getMostCommonGenre(allGenres);

  const recentArtists = recentlyPlayed.map((t) => t.artistName);
  const mostPlayedArtist = getMostPlayedArtist(recentArtists);

  const lastTenPlayed = recentlyPlayed.slice(0, 10);

  // Most searched - derive from recent searches
  const mostSearchedTerm =
    recentSearches.length > 0 ? recentSearches[0].query : null;

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Dashboard
          </h2>
          <p className="mt-2 text-muted">
            Your music insights and listening activity
          </p>
        </header>

        {/* Stats Grid */}
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Music statistics"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalFavoriteSongs}
                </p>
                <p className="text-sm text-muted">Favorite Songs</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <svg
                  className="h-5 w-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalFavoriteArtists}
                </p>
                <p className="text-sm text-muted">Favorite Artists</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <svg
                  className="h-5 w-5 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalFavoriteAlbums}
                </p>
                <p className="text-sm text-muted">Favorite Albums</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {recentlyPlayed.length}
                </p>
                <p className="text-sm text-muted">Recently Played</p>
              </div>
            </div>
          </div>
        </section>

        {/* Insights */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2" aria-label="Insights">
          {/* Favorite Genre & Most Played Artist */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Insights
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted">Favorite Genre</dt>
                <dd className="mt-1 text-lg font-medium text-foreground">
                  {favoriteGenre || "No data yet"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Most Listened Artist</dt>
                <dd className="mt-1 text-lg font-medium text-foreground">
                  {mostPlayedArtist || "No data yet"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Most Recent Search</dt>
                <dd className="mt-1 text-lg font-medium text-foreground">
                  {mostSearchedTerm || "No searches yet"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Recently Played Summary */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Recently Played
            </h3>
            {lastTenPlayed.length === 0 ? (
              <p className="text-sm text-muted">
                No tracks played yet. Start listening to build your history!
              </p>
            ) : (
              <ul className="space-y-3">
                {lastTenPlayed.map((track) => (
                  <li key={`${track.trackId}-${track.trackName}`}>
                    <Link
                      href={`/track/${track.trackId}`}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/5"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-border">
                        {track.artworkUrl100 ? (
                          <Image
                            src={track.artworkUrl100}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg
                              className="h-5 w-5 text-muted"
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
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {track.trackName}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {track.artistName}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
