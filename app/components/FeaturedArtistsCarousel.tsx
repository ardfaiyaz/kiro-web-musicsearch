"use client";

import Image from "next/image";
import Link from "next/link";
import HorizontalScroll from "./HorizontalScroll";
import { RSSFeedItem } from "@/lib/discovery";

interface FeaturedArtistsCarouselProps {
  artists: RSSFeedItem[];
}

export default function FeaturedArtistsCarousel({
  artists,
}: FeaturedArtistsCarouselProps) {
  if (artists.length === 0) return null;

  return (
    <section
      className="animate-on-scroll-slide-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Featured artists"
    >
      <h3 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Featured Artists
      </h3>
      <HorizontalScroll>
        {artists.map((artist) => (
          <Link
            key={artist.artistName}
            href={`/?q=${encodeURIComponent(artist.artistName)}`}
            className="group flex w-36 shrink-0 flex-col items-center gap-4 sm:w-44"
            aria-label={`Explore ${artist.artistName}`}
          >
            <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-32 sm:w-32">
              {artist.artworkUrl100 && (
                <Image
                  src={artist.artworkUrl100.replace("100x100", "300x300")}
                  alt={artist.artistName}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              )}
            </div>
            <span className="glass-light rounded-full px-3 py-1 text-center text-xs font-medium text-foreground transition-premium group-hover:shadow-md sm:text-sm">
              {artist.artistName}
            </span>
          </Link>
        ))}
      </HorizontalScroll>
    </section>
  );
}
