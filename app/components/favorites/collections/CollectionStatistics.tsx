"use client";

import { useRef, useEffect } from "react";
import { FolderPlus, Music, Disc3, Users, Clock } from "lucide-react";
import type { Collection } from "@/lib/collections";

interface CollectionStatisticsProps {
  collections: Collection[];
}

function AnimatedStat({
  target,
  label,
  icon,
}: {
  target: number;
  label: string;
  icon: React.ReactNode;
}) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (animatedRef.current || !displayRef.current) return;
    animatedRef.current = true;
    const el = displayRef.current;
    const startTime = performance.now();
    const duration = 700;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [target]);

  return (
    <div className="flex items-center gap-2 rounded-xl glass-subtle px-3 py-2.5">
      <span className="text-accent" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <span ref={displayRef} className="text-sm font-bold text-foreground">
          0
        </span>
        <p className="text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function CollectionStatistics({
  collections,
}: CollectionStatisticsProps) {
  const totalItems = collections.reduce((sum, c) => sum + c.items.length, 0);
  const totalSongs = collections.reduce(
    (sum, c) => sum + c.items.filter((i) => i.type === "track").length,
    0
  );
  const totalAlbums = collections.reduce(
    (sum, c) => sum + c.items.filter((i) => i.type === "album").length,
    0
  );
  const totalArtists = collections.reduce(
    (sum, c) => sum + c.items.filter((i) => i.type === "artist").length,
    0
  );
  const estimatedMinutes = totalSongs * 3.5 + totalAlbums * 40;

  return (
    <section aria-label="Collection statistics">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <AnimatedStat
          target={collections.length}
          label="Collections"
          icon={<FolderPlus className="h-3.5 w-3.5" />}
        />
        <AnimatedStat
          target={totalItems}
          label="Total Items"
          icon={<Music className="h-3.5 w-3.5" />}
        />
        <AnimatedStat
          target={totalSongs}
          label="Songs"
          icon={<Music className="h-3.5 w-3.5" />}
        />
        <AnimatedStat
          target={totalAlbums}
          label="Albums"
          icon={<Disc3 className="h-3.5 w-3.5" />}
        />
        <AnimatedStat
          target={totalArtists}
          label="Artists"
          icon={<Users className="h-3.5 w-3.5" />}
        />
      </div>
      {estimatedMinutes > 0 && (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted">
          <Clock className="h-3 w-3" aria-hidden="true" />
          ~{Math.round(estimatedMinutes)} min estimated duration
        </p>
      )}
    </section>
  );
}
