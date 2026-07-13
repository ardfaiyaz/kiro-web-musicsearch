"use client";

import Image from "next/image";
import { useAudioPlayer } from "../AudioPlayerContext";

interface VinylSpinnerProps {
  size?: number;
  className?: string;
}

/**
 * VinylSpinner - Spinning vinyl record with album art in center.
 * Animates with CSS rotate while audio is playing.
 * Pauses rotation when playback is paused.
 * Respects reduced motion settings.
 */
export default function VinylSpinner({
  size = 280,
  className = "",
}: VinylSpinnerProps) {
  const { isPlaying, artworkUrl } = useAudioPlayer();
  const artSrc = artworkUrl?.replace("100x100", "300x300") || "";

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Vinyl disc - spinning record */}
      <div
        className={`vinyl-disc absolute inset-0 rounded-full ${isPlaying ? "vinyl-spinning" : "vinyl-paused"}`}
      >
        {/* Vinyl grooves - concentric rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-xl">
          {/* Groove lines */}
          <div className="absolute inset-[8%] rounded-full border border-zinc-700/30" />
          <div className="absolute inset-[15%] rounded-full border border-zinc-700/20" />
          <div className="absolute inset-[22%] rounded-full border border-zinc-700/30" />
          <div className="absolute inset-[28%] rounded-full border border-zinc-700/20" />
          <div className="absolute inset-[34%] rounded-full border border-zinc-700/30" />

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-transparent via-white/5 to-transparent" />

          {/* Center label with album art */}
          <div className="absolute inset-[35%] overflow-hidden rounded-full border-2 border-zinc-600 shadow-inner">
            {artSrc ? (
              <Image
                src={artSrc}
                alt=""
                fill
                sizes={`${Math.round(size * 0.3)}px`}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-700">
                <div className="h-3 w-3 rounded-full bg-zinc-500" />
              </div>
            )}
            {/* Center spindle hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-900 shadow-inner" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
