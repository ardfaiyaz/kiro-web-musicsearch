"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { usePersonalization } from "@/app/components/PersonalizationContext";

export default function PlaylistsPage() {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
  } = usePersonalization();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;
    createPlaylist(name);
    setNewPlaylistName("");
  }

  function handleDelete(playlistId: string) {
    if (expandedId === playlistId) {
      setExpandedId(null);
    }
    deletePlaylist(playlistId);
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Playlists
          </h2>
          <p className="mt-2 text-muted">
            Create and manage your music collections
          </p>
        </header>

        {/* Create New Playlist */}
        <section className="mb-8" aria-label="Create new playlist">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name..."
              className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              aria-label="Playlist name"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </form>
        </section>

        {/* Playlists List */}
        <section aria-label="Your playlists">
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <svg
                className="h-16 w-16 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-foreground">
                No playlists yet
              </h3>
              <p className="max-w-md text-muted">
                Create your first playlist above and start adding tracks from
                song detail pages.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 sm:p-6">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          expandedId === playlist.id ? null : playlist.id
                        )
                      }
                      className="flex flex-1 items-center gap-4 text-left"
                      aria-expanded={expandedId === playlist.id}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                        <svg
                          className="h-6 w-6 text-accent"
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
                        <h3 className="font-semibold text-foreground">
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-muted">
                          {playlist.tracks.length}{" "}
                          {playlist.tracks.length === 1 ? "track" : "tracks"}
                        </p>
                      </div>
                      <svg
                        className={`ml-auto h-5 w-5 text-muted transition-transform ${
                          expandedId === playlist.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(playlist.id)}
                      aria-label={`Delete playlist ${playlist.name}`}
                      className="ml-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Tracks */}
                  {expandedId === playlist.id && (
                    <div className="border-t border-border">
                      {playlist.tracks.length === 0 ? (
                        <p className="px-6 py-4 text-sm text-muted">
                          No tracks in this playlist yet. Browse tracks and add
                          them from the track detail page.
                        </p>
                      ) : (
                        <ul className="divide-y divide-border">
                          {playlist.tracks.map((track) => (
                            <li
                              key={track.trackId}
                              className="flex items-center gap-3 px-4 py-3 sm:px-6"
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
                                <Link
                                  href={`/track/${track.trackId}`}
                                  className="block truncate text-sm font-medium text-foreground transition-colors hover:text-accent"
                                >
                                  {track.trackName}
                                </Link>
                                <p className="truncate text-xs text-muted">
                                  {track.artistName}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeTrackFromPlaylist(
                                    playlist.id,
                                    track.trackId
                                  )
                                }
                                aria-label={`Remove ${track.trackName} from playlist`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
