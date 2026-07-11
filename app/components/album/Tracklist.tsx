"use client";

import Link from "next/link";
import Image from "next/image";
import { useAudioPlayer } from "@/app/components/AudioPlayerContext";
import AnimatedEqualizer from "@/app/components/AnimatedEqualizer";
import ExplicitBadge from "@/app/components/ExplicitBadge";
import AudioPlayer from "@/app/components/AudioPlayer";
import type { ItunesTrack } from "@/lib/types";

interface TracklistProps {
  tracks: ItunesTrack[];
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Tracklist({ tracks }: TracklistProps) {
  const { currentlyPlayingId, isPlaying } = useAudioPlayer();

  if (tracks.length === 0) {
    return (
      <section aria-label="Track listing" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Tracklist</h2>
        <div className="glass-light rounded-2xl p-8 text-center">
          <p className="text-sm italic text-muted">No tracks available for this album.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Track listing" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold text-foreground tracking-tight">
        Tracklist
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border/50">
        <div role="list" aria-label="Album tracks">
          {tracks.map((track, index) => {
            const isActive = currentlyPlayingId === track.trackId;
            const isCurrentlyPlaying = isActive && isPlaying;
            const artworkThumb = track.artworkUrl100?.replace(
              "100x100",
              "60x60"
            );

            return (
              <div
                key={track.trackId}
                role="listitem"
                className={`group flex items-center gap-3 border-b border-border/30 px-4 py-3 transition-colors last:border-b-0 sm:px-5 ${
                  isActive
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "hover:bg-foreground/[0.02]"
                }`}
              >
                {/* Track number / Equalizer */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {isCurrentlyPlaying ? (
                    <AnimatedEqualizer />
                  ) : (
                    <span className="text-sm tabular-nums text-muted">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Artwork thumbnail */}
                {artworkThumb && (
                  <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden rounded-lg sm:block">
                    <Image
                      src={artworkThumb}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Track info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/track/${track.trackId}`}
                      className={`truncate text-sm font-medium transition-colors hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {track.trackName}
                    </Link>
                    {track.trackExplicitness === "explicit" && (
                      <ExplicitBadge />
                    )}
                    {isCurrentlyPlaying && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Playing
                      </span>
                    )}
                  </div>
                  {track.artistName && (
                    <p className="truncate text-xs text-muted">
                      {track.artistName}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <span className="hidden text-sm tabular-nums text-muted sm:block">
                  {track.trackTimeMillis
                    ? formatDuration(track.trackTimeMillis)
                    : "--:--"}
                </span>

                {/* Play button */}
                <div className="shrink-0">
                  <AudioPlayer
                    previewUrl={track.previewUrl}
                    trackId={track.trackId}
                    trackName={track.trackName}
                    artistName={track.artistName}
                    artworkUrl={track.artworkUrl100?.replace(
                      "100x100",
                      "200x200"
                    )}
                    compact
                    track={track}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
