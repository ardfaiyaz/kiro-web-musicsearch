"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Music, Clock, Tag, Headphones } from "lucide-react";

interface AlbumStatsProps {
  releaseYear: string | null;
  trackCount: number;
  totalDuration: string;
  genreCount: number;
  previewCount: number;
}

function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setDisplayValue(value);
      });
      return;
    }

    const duration = 800;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

export default function AlbumStats({
  releaseYear,
  trackCount,
  totalDuration,
  genreCount,
  previewCount,
}: AlbumStatsProps) {
  const stats = [
    {
      icon: Calendar,
      label: "Release Year",
      value: releaseYear || "N/A",
      isNumeric: false,
    },
    {
      icon: Music,
      label: "Tracks",
      value: trackCount,
      isNumeric: true,
    },
    {
      icon: Clock,
      label: "Duration",
      value: totalDuration,
      isNumeric: false,
    },
    {
      icon: Tag,
      label: "Genres",
      value: genreCount,
      isNumeric: true,
    },
    {
      icon: Headphones,
      label: "Previews",
      value: previewCount,
      isNumeric: true,
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      role="list"
      aria-label="Album statistics"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="glass-light flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-center transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
            role="listitem"
          >
            <Icon
              className="h-4 w-4 text-muted"
              aria-hidden="true"
            />
            <span className="text-lg font-bold text-foreground tabular-nums">
              {stat.isNumeric ? (
                <AnimatedCounter
                  value={stat.value as number}
                  suffix={"suffix" in stat ? (stat.suffix as string) : ""}
                />
              ) : (
                stat.value
              )}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {stat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
