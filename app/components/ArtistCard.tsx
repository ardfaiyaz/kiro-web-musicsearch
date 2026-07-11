"use client";

import { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ItunesArtist } from "@/lib/types";

function ArtistCardBase({ artist }: { artist: ItunesArtist }) {
  const artworkUrl = artist.artworkUrl100?.replace("100x100", "200x200");
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link
      href={`/artist/${artist.artistId}`}
      className="cursor-pointer group flex items-center gap-4 rounded-2xl glass-card hover-glow card-tilt p-4 transition-premium hover:border-foreground/10 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full shadow-md">
        {artworkUrl && !imageFailed ? (
          <Image
            src={artworkUrl}
            alt={`${artist.artistName} profile image`}
            fill
            sizes="64px"
            className="object-cover transition-premium group-hover:scale-110"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-foreground/5 text-muted transition-premium group-hover:bg-foreground/10">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <h3 className="truncate text-sm font-bold text-foreground tracking-tight transition-premium group-hover:text-accent">
          {artist.artistName}
        </h3>
        <p className="truncate text-xs text-muted">
          {artist.primaryGenreName || "Music"}
        </p>
      </div>
      <svg
        className="h-4 w-4 shrink-0 text-muted/50 transition-premium group-hover:text-foreground group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </Link>
  );
}

const ArtistCard = memo(ArtistCardBase);
export default ArtistCard;
