import Link from "next/link";
import {
  Sparkles,
  Smartphone,
  Disc3,
  Radio,
  Music,
  Disc,
  Mic2,
  Mic,
} from "lucide-react";
import { DECADE_CATEGORIES } from "@/lib/browse-categories";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sparkles,
  Smartphone,
  Disc3,
  Radio,
  Music,
  Disc,
  Mic2,
  Mic,
};

export default function BrowseByDecade() {
  return (
    <section aria-label="Browse by decade" className="mb-16">
      <h3 className="mb-6 text-2xl font-bold text-foreground">
        Browse by Decade
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {DECADE_CATEGORIES.map((decade) => {
          const Icon = ICON_MAP[decade.icon];
          return (
            <Link
              key={decade.id}
              href={`/?q=${encodeURIComponent(decade.searchQuery)}&year=${encodeURIComponent(decade.id)}`}
              className={`group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br ${decade.gradient} p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03] glass-card aspect-square`}
            >
              <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/20" />
              <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                {Icon && <Icon size={18} className="text-white" aria-hidden="true" />}
              </div>
              <span className="relative z-10 text-sm font-bold text-white drop-shadow-md">
                {decade.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
