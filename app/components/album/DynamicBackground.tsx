"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useColorExtraction } from "@/lib/color-extraction";
import { useDynamicColors } from "@/app/components/DynamicColorProvider";

interface DynamicBackgroundProps {
  artworkUrl: string | null;
}

export default function DynamicBackground({
  artworkUrl,
}: DynamicBackgroundProps) {
  const { colors } = useColorExtraction(artworkUrl);
  const { setPageArtworkUrl } = useDynamicColors();

  useEffect(() => {
    if (artworkUrl) {
      setPageArtworkUrl(artworkUrl);
    }
    return () => {
      setPageArtworkUrl(null);
    };
  }, [artworkUrl, setPageArtworkUrl]);

  const gradientColors = colors
    ? {
        primary: colors.dominant,
        secondary: colors.palette[1] || colors.dominant,
        accent: colors.palette[2] || colors.palette[1] || colors.dominant,
      }
    : {
        primary: "rgb(100, 100, 200)",
        secondary: "rgb(150, 100, 180)",
        accent: "rgb(80, 120, 200)",
      };

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Blurred artwork layer */}
      {artworkUrl && (
        <div className="absolute inset-0 opacity-30">
          <Image
            src={artworkUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-3xl scale-125"
            priority
          />
        </div>
      )}

      {/* Gradient overlay using extracted colors */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${gradientColors.primary}33 0%, transparent 60%),
                       radial-gradient(ellipse at 70% 80%, ${gradientColors.secondary}22 0%, transparent 50%),
                       radial-gradient(ellipse at 50% 50%, ${gradientColors.accent}11 0%, transparent 70%)`,
        }}
      />

      {/* Dark gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent" />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03] ambient-film-grain" />

      {/* Light bloom */}
      {colors && (
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-20 blur-3xl motion-safe:animate-pulse"
          style={{ backgroundColor: colors.dominant }}
        />
      )}
    </div>
  );
}
