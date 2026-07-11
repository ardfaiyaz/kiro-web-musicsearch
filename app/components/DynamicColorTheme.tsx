"use client";

import { ReactNode } from "react";
import { useColorExtraction } from "@/lib/color-extraction";

interface DynamicColorThemeProps {
  imageUrl: string | null | undefined;
  children: ReactNode;
  className?: string;
}

/**
 * A client component that wraps sections and applies dynamic background gradients
 * extracted from artwork using the existing useColorExtraction hook.
 * Uses CSS custom properties to apply colors to hero backgrounds, accent colors,
 * and gradients within the scoped wrapper element.
 */
export default function DynamicColorTheme({
  imageUrl,
  children,
  className = "",
}: DynamicColorThemeProps) {
  const { colors } = useColorExtraction(imageUrl);

  const style = colors
    ? ({
        "--dynamic-accent": colors.dominant,
        "--dynamic-accent-light": colors.palette[1] || colors.dominant,
        "--dynamic-accent-muted": colors.palette[2] || colors.palette[1] || colors.dominant,
      } as React.CSSProperties)
    : undefined;

  return (
    <div className={className} style={style}>
      {colors && (
        <div
          className="pointer-events-none absolute inset-0 opacity-10 transition-opacity duration-700"
          style={{
            background: `linear-gradient(135deg, ${colors.dominant} 0%, ${colors.palette[1] || colors.dominant} 50%, transparent 100%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
