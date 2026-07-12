"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ExternalLink, Disc3 } from "lucide-react";

interface AlbumData {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  primaryGenreName: string;
  releaseDate: string;
  trackCount: number;
}

const CURATED_SEARCHES = [
  "dark side of the moon", "thriller michael jackson", "abbey road beatles",
  "rumours fleetwood mac", "nevermind nirvana", "back in black ac dc",
  "born to run springsteen", "purple rain prince", "appetite for destruction",
  "ok computer radiohead", "the wall pink floyd", "blue joni mitchell",
  "kind of blue miles davis", "lemonade beyonce", "to pimp a butterfly",
  "good kid maad city", "channel orange frank ocean", "folklore taylor swift",
  "in rainbows radiohead", "loveless my bloody valentine", "homogenic bjork",
  "pet sounds beach boys", "the rise and fall ziggy stardust",
  "songs in the key of life stevie wonder", "what's going on marvin gaye",
  "the miseducation lauryn hill", "illmatic nas", "ready to die notorious",
  "electric ladyland jimi hendrix", "innervisions stevie wonder",
  "blonde frank ocean",
];

const EDITORIAL_DESCRIPTIONS: Record<string, string> = {
  default: "A standout record that shaped its genre and continues to inspire new generations of music lovers.",
};

function getDailyIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return day % CURATED_SEARCHES.length;
}

function getEditorialDescription(genre: string): string {
  const descriptions: Record<string, string> = {
    Rock: "A landmark rock album that pushed the boundaries of the genre and defined a generation.",
    Pop: "An iconic pop record filled with unforgettable hooks and timeless production.",
    "Hip-Hop/Rap": "A groundbreaking hip-hop album that elevated storytelling and lyricism to new heights.",
    "R&B/Soul": "A soulful masterpiece that blends emotion, rhythm, and vocal brilliance.",
    Jazz: "A jazz essential that redefined improvisation and musical expression.",
    Electronic: "An electronic journey that pioneered new sonic landscapes.",
    Alternative: "An alternative classic that challenged conventions and created new possibilities.",
    Country: "A country gem that tells stories of life, love, and the human experience.",
  };
  return descriptions[genre] || EDITORIAL_DESCRIPTIONS.default;
}

export default function AlbumOfTheDay() {
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAlbum() {
      try {
        const index = getDailyIndex();
        const search = CURATED_SEARCHES[index];

        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(search)}&media=music&entity=album&limit=3`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        const albums = data.results.filter(
          (r: { wrapperType: string }) => r.wrapperType === "collection"
        );

        if (albums.length === 0) throw new Error("No album found");

        setAlbum(albums[0]);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAlbum();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6" aria-busy="true">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 rounded shimmer-wave" />
          <div className="h-5 w-32 rounded shimmer-wave" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="aspect-square w-40 rounded-xl shimmer-wave sm:w-48" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-6 w-48 rounded shimmer-wave" />
            <div className="h-4 w-32 rounded shimmer-wave" />
            <div className="h-16 w-full rounded shimmer-wave" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) return null;

  const artworkLarge = album.artworkUrl100.replace("100x100", "400x400");
  const releaseYear = new Date(album.releaseDate).getFullYear();
  const description = getEditorialDescription(album.primaryGenreName);

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden" aria-label="Album of the Day">
      <div className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Album of the Day
          </span>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row">
          {/* Artwork */}
          <Link
            href={`/album/${album.collectionId}`}
            className="group relative aspect-square w-40 shrink-0 overflow-hidden rounded-xl shadow-lg transition-transform hover:scale-[1.02] sm:w-48"
          >
            <Image
              src={artworkLarge}
              alt={`${album.collectionName} by ${album.artistName}`}
              fill
              sizes="(max-width: 640px) 160px, 192px"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
              <Disc3 className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
          </Link>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-center">
            <Link
              href={`/album/${album.collectionId}`}
              className="text-xl font-bold text-foreground transition-colors hover:text-foreground/80 sm:text-2xl"
            >
              {album.collectionName}
            </Link>
            <p className="mt-1 text-sm text-muted">
              {album.artistName} &middot; {releaseYear}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-muted">
                {album.primaryGenreName}
              </span>
              <span className="inline-flex items-center rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-muted">
                {album.trackCount} tracks
              </span>
              <Link
                href={`/album/${album.collectionId}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-opacity hover:opacity-70"
              >
                View Album
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
