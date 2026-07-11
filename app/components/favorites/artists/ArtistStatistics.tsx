"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Disc3, Music, Layers } from "lucide-react";
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

export default function ArtistStatistics() {
  const { favoriteArtists, favoriteAlbums, favorites } = useFavorites();

  const genres = new Set(
    favoriteArtists.map((a) => a.primaryGenreName).filter(Boolean)
  );

  const stats: StatItem[] = [
    {
      label: "Favorite Artists",
      value: favoriteArtists.length,
      icon: <Users className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Albums Saved",
      value: favoriteAlbums.length,
      icon: <Disc3 className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Songs Saved",
      value: favorites.length,
      icon: <Music className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "Genres",
      value: genres.size,
      icon: <Layers className="h-5 w-5" aria-hidden="true" />,
    },
  ];

  return (
    <section aria-label="Artist statistics" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
