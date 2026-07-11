"use client";

import { useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/app/components/FavoritesContext";
import TrackGrid from "@/app/components/TrackGrid";
import ArtistCard from "@/app/components/ArtistCard";
import AlbumCard from "@/app/components/AlbumCard";
import CollectionsManager from "@/app/components/CollectionsManager";
import Header from "@/app/components/Header";

type TabId = "songs" | "artists" | "albums" | "collections";

const TABS: { id: TabId; label: string }[] = [
  { id: "songs", label: "Songs" },
  { id: "artists", label: "Artists" },
  { id: "albums", label: "Albums" },
  { id: "collections", label: "Collections" },
];

export default function FavoritesPage() {
  const { favorites, favoriteArtists, favoriteAlbums } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabId>("songs");

  function getTabCount(tabId: TabId): number {
    switch (tabId) {
      case "songs":
        return favorites.length;
      case "artists":
        return favoriteArtists.length;
      case "albums":
        return favoriteAlbums.length;
      default:
        return 0;
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <section aria-label="Your favorites">
          <header className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your Favorites
            </h2>
            <p className="mt-3 text-lg text-muted">
              Your personal music library
            </p>
          </header>

          {/* Tab Navigation */}
          <nav
            className="mb-8 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Favorites sections"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background shadow-md"
                    : "glass-card text-muted hover:text-foreground hover:border-foreground/10"
                }`}
              >
                {tab.label}
                {tab.id !== "collections" && getTabCount(tab.id) > 0 && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                      activeTab === tab.id
                        ? "bg-background/20 text-background"
                        : "bg-foreground/10 text-muted"
                    }`}
                  >
                    {getTabCount(tab.id)}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Songs Tab */}
          {activeTab === "songs" && (
            <div
              id="tabpanel-songs"
              role="tabpanel"
              aria-label="Favorite songs"
            >
              {favorites.length === 0 ? (
                <EmptyState
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 8.25c0-3.15-2.7-5.25-5.437-5.25A5.5 5.5 0 0012 5.052 5.5 5.5 0 007.688 3C4.95 3 2.25 5.1 2.25 8.25c0 7.22 9.75 12.75 9.75 12.75s9.75-5.53 9.75-12.75z"
                    />
                  }
                  title="No favorite songs yet"
                  description="Search for music and click the heart icon on any track to add it to your favorites."
                />
              ) : (
                <TrackGrid tracks={favorites} />
              )}
            </div>
          )}

          {/* Artists Tab */}
          {activeTab === "artists" && (
            <div
              id="tabpanel-artists"
              role="tabpanel"
              aria-label="Favorite artists"
            >
              {favoriteArtists.length === 0 ? (
                <EmptyState
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  }
                  title="No favorite artists yet"
                  description="Visit artist pages and add them to your favorites to see them here."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteArtists.map((artist) => (
                    <ArtistCard key={artist.artistId} artist={artist} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Albums Tab */}
          {activeTab === "albums" && (
            <div
              id="tabpanel-albums"
              role="tabpanel"
              aria-label="Favorite albums"
            >
              {favoriteAlbums.length === 0 ? (
                <EmptyState
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                    />
                  }
                  title="No favorite albums yet"
                  description="Visit album pages and add them to your favorites to see them here."
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {favoriteAlbums.map((album) => (
                    <AlbumCard key={album.collectionId} album={album} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collections Tab */}
          {activeTab === "collections" && (
            <div
              id="tabpanel-collections"
              role="tabpanel"
              aria-label="Your collections"
            >
              <CollectionsManager />
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
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
          {icon}
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-muted">{description}</p>
      <Link
        href="/"
        className="cursor-pointer mt-4 rounded-2xl bg-foreground px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Discover Music
      </Link>
    </div>
  );
}
