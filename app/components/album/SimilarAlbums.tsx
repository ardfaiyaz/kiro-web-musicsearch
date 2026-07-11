"use client";

import Link from "next/link";
import Image from "next/image";
import { Disc3 } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface SimilarAlbumsProps {
  albums: ItunesAlbum[];
  currentAlbumId: number;
}

export default function SimilarAlbums({
  albums,
  currentAlbumId,
}: SimilarAlbumsProps) {
  const filtered = albums.filter(
    (a) => a.collectionId !== currentAlbumId
  );

  if (filtered.length === 0) {
    return (
      <section
        aria-label="Similar albums"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
          More From This Artist
        </h2>
        <div className="glass-light rounded-2xl p-8 text-center">
          <p className="text-sm italic text-muted">
            Explore this artist&apos;s other releases.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Similar albums"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
        More From This Artist
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {filtered.slice(0, 10).map((album) => {
          const artworkUrl = album.artworkUrl100?.replace(
            "100x100",
            "300x300"
          );
          const year = album.releaseDate
            ? new Date(album.releaseDate).getFullYear()
            : null;

          return (
            <Link
              key={album.collectionId}
              href={`/album/${album.collectionId}`}
              className="group flex w-40 shrink-0 snap-start flex-col gap-2 rounded-2xl p-3 transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary glass-light sm:w-48"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                {artworkUrl ? (
                  <Image
                    src={artworkUrl}
                    alt={`${album.collectionName} artwork`}
                    fill
                    sizes="(max-width: 640px) 160px, 192px"
                    className="object-cover transition-transform duration-[var(--duration-standard)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-foreground/5">
                    <Disc3
                      className="h-8 w-8 text-muted"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {album.collectionName}
                </p>
                <p className="truncate text-xs text-muted">
                  {year && `${year} \u00b7 `}
                  {album.primaryGenreName}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
