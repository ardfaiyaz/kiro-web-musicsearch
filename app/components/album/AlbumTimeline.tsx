"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Disc3 } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface AlbumTimelineProps {
  artistAlbums: ItunesAlbum[];
  currentAlbumId: number;
}

export default function AlbumTimeline({
  artistAlbums,
  currentAlbumId,
}: AlbumTimelineProps) {
  if (artistAlbums.length <= 1) {
    return null;
  }

  // Sort chronologically
  const sorted = [...artistAlbums].sort(
    (a, b) =>
      new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  const currentIndex = sorted.findIndex(
    (a) => a.collectionId === currentAlbumId
  );
  const prevAlbum = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextAlbum =
    currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
  const currentAlbum = sorted[currentIndex];

  if (!currentAlbum) return null;

  return (
    <section
      aria-label="Album timeline"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
        Career Timeline
      </h2>
      <div className="flex items-center justify-center gap-4">
        {/* Previous album */}
        {prevAlbum ? (
          <TimelineNode album={prevAlbum} isCurrent={false} />
        ) : (
          <div className="hidden w-32 sm:block" />
        )}

        {/* Arrow */}
        {prevAlbum && (
          <ChevronRight
            className="hidden h-5 w-5 shrink-0 text-muted sm:block"
            aria-hidden="true"
          />
        )}

        {/* Current album */}
        <TimelineNode album={currentAlbum} isCurrent={true} />

        {/* Arrow */}
        {nextAlbum && (
          <ChevronRight
            className="hidden h-5 w-5 shrink-0 text-muted sm:block"
            aria-hidden="true"
          />
        )}

        {/* Next album */}
        {nextAlbum ? (
          <TimelineNode album={nextAlbum} isCurrent={false} />
        ) : (
          <div className="hidden w-32 sm:block" />
        )}
      </div>
    </section>
  );
}

function TimelineNode({
  album,
  isCurrent,
}: {
  album: ItunesAlbum;
  isCurrent: boolean;
}) {
  const artworkUrl = album.artworkUrl100?.replace("100x100", "200x200");
  const year = album.releaseDate
    ? new Date(album.releaseDate).getFullYear()
    : null;

  const content = (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition-transform ${
        isCurrent
          ? "glass-medium ring-2 ring-primary/30 scale-110"
          : "glass-light hover:scale-[1.02] motion-reduce:hover:scale-100"
      }`}
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-xl sm:h-24 sm:w-24">
        {artworkUrl ? (
          <Image
            src={artworkUrl}
            alt={`${album.collectionName} artwork`}
            fill
            sizes="96px"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground/5">
            <Disc3 className="h-6 w-6 text-muted" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p
          className={`max-w-[120px] truncate text-xs font-semibold ${
            isCurrent ? "text-primary" : "text-foreground"
          }`}
        >
          {album.collectionName}
        </p>
        {year && <p className="text-[11px] text-muted">{year}</p>}
      </div>
    </div>
  );

  if (isCurrent) {
    return <div aria-current="true">{content}</div>;
  }

  return (
    <Link
      href={`/album/${album.collectionId}`}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      {content}
    </Link>
  );
}
