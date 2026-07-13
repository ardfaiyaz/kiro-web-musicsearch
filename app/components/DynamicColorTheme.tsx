"use client";

import { ReactNode } from "react";
import { useColorExtraction } from "@/lib/color-extraction";

interface DynamicColorThemeProps {
  imageUrl: string | null | undefined;
  children: ReactNode;
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}

/**
 * A client component that wraps sections and applies dynamic background gradients
 * extracted from artwork using the existing useColorExtraction hook.
 * Supports three intensity levels for different page contexts:
 * - subtle: 10% opacity gradient overlay (cards, sidebars)
 * - medium: 20% opacity gradient overlay (default, section backgrounds)
 * - strong: 30% opacity gradient overlay (hero sections, full-page backgrounds)
 */
export default function DynamicColorTheme({
  imageUrl,
  children,
  className = "",
  intensity = "medium",
}: DynamicColorThemeProps) {
  const { colors } = useColorExtraction(imageUrl);

  const opacityMap = {
    subtle: "opacity-[0.08]",
    medium: "opacity-[0.15]",
    strong: "opacity-[0.25]",
  };

  const style = colors
    ? ({
        "--dynamic-accent": colors.dominant,
        "--dynamic-accent-light": colors.palette[1] || colors.dominant,
        "--dynamic-accent-muted":
          colors.palette[2] || colors.palette[1] || colors.dominant,
        "--dynamic-accent-secondary": colors.palette[3] || colors.palette[1] || colors.dominant,
      } as React.CSSProperties)
    : undefined;

  return (
    <div className={`relative ${className}`} style={style}>
      {colors && (
        <>
          {/* Primary radial gradient from top-left */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${opacityMap[intensity]}`}
            style={{
              background: `radial-gradient(ellipse at 20% 0%, ${colors.dominant} 0%, transparent 60%)`,
            }}
            aria-hidden="true"
          />
          {/* Secondary gradient from bottom-right */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${opacityMap[intensity === "strong" ? "medium" : "subtle"]}`}
            style={{
              background: `radial-gradient(ellipse at 80% 100%, ${colors.palette[1] || colors.dominant} 0%, transparent 60%)`,
            }}
            aria-hidden="true"
          />
          {/* Ambient color wash at the top for hero sections */}
          {intensity === "strong" && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-20 transition-opacity duration-1000"
              style={{
                background: `linear-gradient(180deg, ${colors.dominant} 0%, ${colors.palette[1] || colors.dominant} 40%, transparent 100%)`,
              }}
              aria-hidden="true"
            />
          )}
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
