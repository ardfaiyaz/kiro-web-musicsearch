"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSmartPlaylists, SmartPlaylist } from "@/lib/smart-playlists";

export default function SmartPlaylists() {
  const [playlists, setPlaylists] = useState<SmartPlaylist[]>(() => {
    if (typeof window === "undefined") return [];
    return getSmartPlaylists();
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Re-check periodically for updated history
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaylists(getSmartPlaylists());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (playlists.length === 0) return null;

  return (
    <section aria-label="Smart playlists" className="mb-10">
      <h3 className="mb-4 text-xl font-bold text-foreground">
        Smart Playlists
      </h3>
      <p className="mb-4 text-sm text-muted">
        Auto-generated from your listening history
      </p>
      <div className="space-y-3">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="overflow-hidden rounded-2xl border border-border bg-card/50 transition-all"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedId(
                  expandedId === playlist.id ? null : playlist.id
                )
              }
              className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
              aria-expanded={expandedId === playlist.id}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <svg
                  className="h-5 w-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground">
                  {playlist.name}
                </h4>
                <p className="text-xs text-muted">{playlist.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-muted">
                {playlist.tracks.length} tracks
              </span>
              <svg
                className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
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

            {expandedId === playlist.id && (
              <div className="border-t border-border">
                <ul className="divide-y divide-border/50">
                  {playlist.tracks.slice(0, 10).map((track) => (
                    <li
                      key={track.trackId}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-border">
                        {track.artworkUrl100 ? (
                          <Image
                            src={track.artworkUrl100}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg
                              className="h-4 w-4 text-muted"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/track/${track.trackId}`}
                          className="block truncate text-sm font-medium text-foreground hover:text-muted transition-colors"
                        >
                          {track.trackName}
                        </Link>
                        <p className="truncate text-xs text-muted">
                          {track.artistName}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                {playlist.tracks.length > 10 && (
                  <p className="px-5 py-3 text-xs text-muted">
                    +{playlist.tracks.length - 10} more tracks
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
