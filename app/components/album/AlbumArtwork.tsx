"use client";

import { useState } from "react";
import Image from "next/image";
import { useColorExtraction } from "@/lib/color-extraction";

interface AlbumArtworkProps {
  artworkUrl: string | null;
  albumName: string;
  onOpenViewer: () => void;
}

export default function AlbumArtwork({
  artworkUrl,
  albumName,
  onOpenViewer,
}: AlbumArtworkProps) {
  const { colors } = useColorExtraction(artworkUrl);
  const [imageError, setImageError] = useState(false);

  const initials = albumName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const glowColor = colors?.dominant || "rgba(100, 100, 200, 0.3)";

  if (!artworkUrl || imageError) {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-xs lg:max-w-sm">
        <div className="glass-medium flex h-full w-full items-center justify-center rounded-2xl border border-border/30">
          <span className="text-5xl font-bold text-muted/60">{initials}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenViewer}
      className="group relative mx-auto aspect-square w-full max-w-xs lg:max-w-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
      aria-label={`View ${albumName} artwork in fullscreen`}
    >
      {/* Ambient glow */}
      <div
        className="absolute -inset-3 rounded-3xl opacity-40 blur-2xl transition-opacity duration-[var(--duration-standard)] group-hover:opacity-60 motion-reduce:transition-none"
        style={{ backgroundColor: glowColor }}
        aria-hidden="true"
      />

      {/* Artwork container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-2xl transition-transform duration-[220ms] ease-out group-hover:scale-[1.03] group-hover:shadow-3xl motion-reduce:transition-none motion-reduce:group-hover:scale-100">
        <Image
          src={artworkUrl}
          alt={`${albumName} album artwork`}
          fill
          sizes="(max-width: 1024px) 320px, 384px"
          className="object-cover"
          priority
          onError={() => setImageError(true)}
        />

        {/* Glass reflection sweep on hover */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100 motion-reduce:hidden"
          aria-hidden="true"
        />
      </div>
    </button>
  );
}
