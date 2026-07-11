import Link from "next/link";
import { User, Building2 } from "lucide-react";
import type { ItunesAlbum, ItunesTrack, SpotifyAlbum } from "@/lib/types";

interface AlbumCreditsProps {
  album: ItunesAlbum;
  tracks: ItunesTrack[];
  spotify?: SpotifyAlbum;
}

export default function AlbumCredits({
  album,
  tracks,
  spotify,
}: AlbumCreditsProps) {
  // Extract featured artists from track names (artists different from album artist)
  const featuredArtists = [
    ...new Set(
      tracks
        .map((t) => t.artistName)
        .filter((name) => name !== album.artistName)
    ),
  ];

  const hasCredits = featuredArtists.length > 0 || album.artistName;

  if (!hasCredits) {
    return null;
  }

  return (
    <section
      aria-label="Album credits"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
        Credits
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Primary Artist */}
        <Link
          href={`/artist/${album.artistId}`}
          className="glass-light group flex items-center gap-4 rounded-2xl p-4 transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {album.artistName}
            </p>
            <p className="text-xs text-muted">Primary Artist</p>
          </div>
        </Link>

        {/* Featured Artists */}
        {featuredArtists.slice(0, 5).map((artist) => (
          <div
            key={artist}
            className="glass-light flex items-center gap-4 rounded-2xl p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground/5">
              <User className="h-5 w-5 text-muted" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {artist}
              </p>
              <p className="text-xs text-muted">Featured Artist</p>
            </div>
          </div>
        ))}

        {/* Record Label (from Spotify or iTunes metadata) */}
        {spotify && (
          <div className="glass-light flex items-center gap-4 rounded-2xl p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground/5">
              <Building2 className="h-5 w-5 text-muted" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {spotify.artistName}
              </p>
              <p className="text-xs text-muted">Distributed by</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
