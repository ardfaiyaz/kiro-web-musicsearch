"use client";

import Image from "next/image";
import type { CollectionItem } from "@/lib/collections";
import type { ItunesTrack } from "@/lib/types";

interface CollectionCoverGeneratorProps {
  items: CollectionItem[];
  coverStyle: "single" | "grid2x2" | "grid3x3" | "gradient";
  size?: number;
  className?: string;
}

// Variant that auto-generates covers from playlist tracks
interface PlaylistCoverGeneratorProps {
  tracks: ItunesTrack[];
  size?: number;
  className?: string;
}

export function PlaylistCoverGenerator({
  tracks,
  size = 200,
  className = "",
}: PlaylistCoverGeneratorProps) {
  const artworks = tracks
    .filter((t) => t.artworkUrl100)
    .map((t) => t.artworkUrl100)
    .slice(0, 9);

  if (artworks.length === 0) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg
          className="h-1/3 w-1/3 text-white/40"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
          />
        </svg>
      </div>
    );
  }

  if (artworks.length < 4) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={artworks[0]}
          alt="Playlist cover"
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  // Use 3x3 grid if we have 5+ artworks, otherwise 2x2
  const useGrid3 = artworks.length >= 5;
  const gridCount = useGrid3 ? 9 : 4;
  const grid = artworks.slice(0, gridCount);
  while (grid.length < gridCount) {
    grid.push(grid[grid.length - 1]);
  }

  return (
    <div
      className={`grid ${useGrid3 ? "grid-cols-3 grid-rows-3" : "grid-cols-2 grid-rows-2"} gap-0.5 overflow-hidden rounded-xl ${className}`}
      style={{ width: size, height: size }}
    >
      {grid.map((url, i) => (
        <div key={i} className="relative overflow-hidden">
          <Image
            src={url}
            alt={`Cover artwork ${i + 1}`}
            fill
            className="object-cover"
            sizes={`${Math.ceil(size / (useGrid3 ? 3 : 2))}px`}
          />
        </div>
      ))}
    </div>
  );
}

const GRADIENT_COLORS = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
  ["#fccb90", "#d57eeb"],
  ["#e0c3fc", "#8ec5fc"],
];

function getGradient(items: CollectionItem[]): string {
  const idx = items.length % GRADIENT_COLORS.length;
  const [c1, c2] = GRADIENT_COLORS[idx];
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}

export default function CollectionCoverGenerator({
  items,
  coverStyle,
  size = 200,
  className = "",
}: CollectionCoverGeneratorProps) {
  const artworks = items
    .filter((i) => i.artworkUrl)
    .map((i) => i.artworkUrl as string);

  if (coverStyle === "single" && artworks.length > 0) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={artworks[0]}
          alt="Collection cover"
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  if (coverStyle === "grid2x2" && artworks.length >= 1) {
    const grid = artworks.slice(0, 4);
    while (grid.length < 4) {
      grid.push(grid[grid.length - 1] || "");
    }
    return (
      <div
        className={`grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        {grid.map((url, i) =>
          url ? (
            <div key={i} className="relative overflow-hidden">
              <Image
                src={url}
                alt={`Cover artwork ${i + 1}`}
                fill
                className="object-cover"
                sizes={`${Math.ceil(size / 2)}px`}
              />
            </div>
          ) : (
            <div
              key={i}
              className="bg-foreground/10"
              aria-hidden="true"
            />
          )
        )}
      </div>
    );
  }

  if (coverStyle === "grid3x3" && artworks.length >= 1) {
    const grid = artworks.slice(0, 9);
    while (grid.length < 9) {
      grid.push(grid[grid.length - 1] || "");
    }
    return (
      <div
        className={`grid grid-cols-3 grid-rows-3 gap-0.5 overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        {grid.map((url, i) =>
          url ? (
            <div key={i} className="relative overflow-hidden">
              <Image
                src={url}
                alt={`Cover artwork ${i + 1}`}
                fill
                className="object-cover"
                sizes={`${Math.ceil(size / 3)}px`}
              />
            </div>
          ) : (
            <div
              key={i}
              className="bg-foreground/10"
              aria-hidden="true"
            />
          )
        )}
      </div>
    );
  }

  // Default: gradient
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-xl ${className}`}
      style={{
        width: size,
        height: size,
        background: getGradient(items),
      }}
      aria-hidden="true"
    >
      <svg
        className="h-1/3 w-1/3 text-white/40"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
        />
      </svg>
    </div>
  );
}
