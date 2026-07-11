"use client";

import Image from "next/image";
import { Disc3 } from "lucide-react";
import type { SpotifyAlbum } from "@/lib/types";

interface DiscographyPreviewProps {
  albums: SpotifyAlbum[];
}

export default function DiscographyPreview({ albums }: DiscographyPreviewProps) {
  if (albums.length === 0) return null;

  return (
    <section aria-label="Discography" className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Discography</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin" role="list">
        {albums.map((album) => (
          <a
            key={album.id}
            href={album.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            className="group flex w-32 shrink-0 flex-col gap-2 rounded-xl p-2 transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              {album.images[0]?.url ? (
                <Image
                  src={album.images[0].url}
                  alt={`${album.name} artwork`}
                  fill
                  sizes="128px"
                  className="object-cover transition-transform duration-[180ms] group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
                  <Disc3 className="h-8 w-8" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="space-y-0.5">
              <p className="line-clamp-1 text-xs font-medium text-foreground">
                {album.name}
              </p>
              <p className="text-[10px] text-muted">
                {album.releaseDate?.slice(0, 4)} &middot; {album.totalTracks} tracks
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
