"use client";

import { useEffect, useRef, useState } from "react";
import { Disc3, Users, Layers, Calendar, Music } from "lucide-react";
import { useFavorites } from "@/app/components/FavoritesContext";

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function AnimatedCounter({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;

    const duration = 700;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  if (target === 0) return <span>0</span>;

  return <span>{current.toLocaleString()}</span>;
}

export default function AlbumStatistics() {
  const { favoriteAlbums } = useFavorites();

  const uniqueArtists = new Set(favoriteAlbums.map((a) => a.artistName)).size;
  const uniqueGenres = new Set(
    favoriteAlbums.map((a) => a.primaryGenreName).filter(Boolean)
  ).size;

  const decades = new Set(
    favoriteAlbums
      .map((a) => {
        const year = new Date(a.releaseDate).getFullYear();
        if (isNaN(year)) return null;
        return `${Math.floor(year / 10) * 10}s`;
      })
      .filter(Boolean)
  ).size;

  const totalTracks = favoriteAlbums.reduce((sum, a) => sum + (a.trackCount || 0), 0);

  const stats: StatItem[] = [
    {
      label: "Albums Saved",
      value: favoriteAlbums.length,
      icon: <Disc3 className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Artists",
      value: uniqueArtists,
      icon: <Users className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Genres",
      value: uniqueGenres,
      icon: <Layers className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Decades",
      value: decades,
      icon: <Calendar className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Tracks",
      value: totalTracks,
      icon: <Music className="h-5 w-5" aria-hidden="true" />,
    },
  ];

  return (
    <section aria-label="Album statistics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="flex flex-col items-center gap-2 rounded-2xl glass-subtle p-4 text-center"
        >
          <div className="text-accent">{stat.icon}</div>
          <p className="text-2xl font-bold text-foreground">
            <AnimatedCounter target={stat.value} />
          </p>
          <p className="text-xs text-muted">{stat.label}</p>
        </article>
      ))}
    </section>
  );
}
