"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Disc3, Tag } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface ArtistBioProps {
  bio: string | null;
  genres: string[];
  albums: ItunesAlbum[];
  artistName: string;
}

export default function ArtistBio({
  bio,
  genres,
  albums,
  artistName,
}: ArtistBioProps) {
  const [expanded, setExpanded] = useState(false);

  const cleanBio = bio
    ? bio.replace(/<a\b[^>]*>.*?<\/a>/gi, "").trim()
    : null;

  // Compute career milestones from albums
  const sortedAlbums = [...albums].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );
  const firstAlbum = sortedAlbums[0];
  const latestAlbum = sortedAlbums[sortedAlbums.length - 1];
  const startYear = firstAlbum ? new Date(firstAlbum.releaseDate).getFullYear() : null;
  const latestYear = latestAlbum ? new Date(latestAlbum.releaseDate).getFullYear() : null;

  // Genre tag colors
  const tagColors = [
    "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ];

  return (
    <section id="about" className="animate-on-scroll-slide-up" aria-label={`About ${artistName}`}>
      <h2 className="mb-6 text-2xl font-bold text-foreground tracking-tight">
        About
      </h2>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Biography text */}
        <div className="lg:col-span-2">
          {cleanBio ? (
            <div className="relative">
              <p
                className={`text-base leading-relaxed text-text-secondary sm:text-lg ${
                  !expanded ? "line-clamp-3" : ""
                }`}
              >
                {cleanBio}
              </p>
              {cleanBio.length > 200 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-primary transition-premium hover:text-primary-hover"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Read less" : "Read more about this artist"}
                >
                  {expanded ? "Read less" : "Read more"}
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-base italic text-muted">
              Biography unavailable for this artist.
            </p>
          )}

          {/* Genre tag cloud */}
          {genres.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
                <Tag className="h-4 w-4" aria-hidden="true" />
                Genres & Styles
              </h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre, index) => (
                  <span
                    key={genre}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${tagColors[index % tagColors.length]}`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Career timeline sidebar */}
        <aside className="glass-subtle rounded-2xl p-5" aria-label="Career milestones">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Career Milestones
          </h3>
          <div className="flex flex-col gap-4">
            {startYear && (
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    First Release: {startYear}
                  </p>
                  {firstAlbum && (
                    <p className="text-xs text-muted">{firstAlbum.collectionName}</p>
                  )}
                </div>
              </div>
            )}

            {latestYear && latestYear !== startYear && (
              <div className="flex items-start gap-3">
                <Disc3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Latest Release: {latestYear}
                  </p>
                  {latestAlbum && (
                    <p className="text-xs text-muted">{latestAlbum.collectionName}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Disc3 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {albums.length} Album{albums.length !== 1 ? "s" : ""} Released
                </p>
                {startYear && latestYear && (
                  <p className="text-xs text-muted">
                    Over {latestYear - startYear} year{latestYear - startYear !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
