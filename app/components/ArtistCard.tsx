"use client";

import { useState } from "react";
import Image from "next/image";
import { ItunesArtist } from "@/lib/types";

export default function ArtistCard({ artist }: { artist: ItunesArtist }) {
  const artworkUrl = artist.artworkUrl100?.replace("100x100", "200x200");
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <a
      href={artist.artistLinkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
        {artworkUrl && !imageFailed ? (
          <Image
            src={artworkUrl}
            alt={`${artist.artistName} profile image`}
            fill
            sizes="56px"
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
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
        <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
          {artist.artistName}
        </h3>
        <p className="truncate text-xs text-muted">
          {artist.primaryGenreName || "Music"}
        </p>
      </div>
      <svg
        className="h-5 w-5 shrink-0 text-muted transition-colors group-hover:text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        />
      </svg>
    </a>
  );
}
