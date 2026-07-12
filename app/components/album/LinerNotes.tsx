"use client";

import Image from "next/image";
import type { ItunesTrack } from "@/lib/types";

interface LinerNotesProps {
  track: ItunesTrack;
  artworkUrl?: string;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatYear(dateString: string): string {
  return new Date(dateString).getFullYear().toString();
}

/**
 * Vinyl liner notes styled section with credits, story, large artwork on track pages.
 * Designed to evoke the experience of reading physical vinyl record liner notes
 * with a typewriter-style font for track information and warm, vintage aesthetics.
 */
export default function LinerNotes({ track, artworkUrl }: LinerNotesProps) {
  const highResArtwork =
    artworkUrl || track.artworkUrl100?.replace("100x100", "600x600");

  return (
    <section
      className="glass-stats overflow-hidden rounded-2xl"
      aria-label="Liner notes"
    >
      {/* Header with large artwork */}
      <div className="relative flex flex-col md:flex-row">
        {/* Large Artwork */}
        {highResArtwork && (
          <div className="relative aspect-square w-full shrink-0 md:w-72 lg:w-80">
            <Image
              src={highResArtwork}
              alt={`${track.trackName} album artwork`}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
            />
            {/* Vinyl record overlay effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 md:block hidden"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Credits section - typewriter style */}
        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <header className="mb-6">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              From the album
            </p>
            <h3 className="font-mono text-xl font-bold text-foreground md:text-2xl">
              {track.collectionName}
            </h3>
            <p className="mt-1 font-mono text-sm text-muted">
              {track.artistName}
            </p>
          </header>

          {/* Track info in liner notes style */}
          <div className="space-y-4 border-t border-border/50 pt-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                  Track {track.trackNumber || ""}
                </p>
                <p className="font-mono text-base font-semibold text-foreground">
                  {track.trackName}
                </p>
              </div>
              <span className="font-mono text-xs text-muted">
                {formatDuration(track.trackTimeMillis)}
              </span>
            </div>

            {/* Credits grid */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border/50 pt-4">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  Artist
                </dt>
                <dd className="font-mono text-xs text-foreground">
                  {track.artistName}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  Genre
                </dt>
                <dd className="font-mono text-xs text-foreground">
                  {track.primaryGenreName}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  Released
                </dt>
                <dd className="font-mono text-xs text-foreground">
                  {formatYear(track.releaseDate)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  Disc
                </dt>
                <dd className="font-mono text-xs text-foreground">
                  {track.discNumber || 1} of {track.discCount || 1}
                </dd>
              </div>
            </dl>

            {/* Story / context section */}
            <div className="border-t border-border/50 pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted mb-2">
                Notes
              </p>
              <p className="font-mono text-xs leading-relaxed text-foreground/70 italic">
                &ldquo;{track.trackName}&rdquo; is a {track.primaryGenreName.toLowerCase()} track
                from the album &ldquo;{track.collectionName}&rdquo;, released in{" "}
                {formatYear(track.releaseDate)} by {track.artistName}. With a runtime of{" "}
                {formatDuration(track.trackTimeMillis)}, this piece captures the essence of the
                artist&apos;s creative vision during this era of their career.
              </p>
            </div>
          </div>

          {/* Copyright footer */}
          <footer className="mt-6 border-t border-border/50 pt-3">
            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted/60">
              &copy; {formatYear(track.releaseDate)} {track.artistName}. All
              rights reserved. Preview provided by Apple Music.
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
}
