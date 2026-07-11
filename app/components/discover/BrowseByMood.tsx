import Link from "next/link";
import {
  Sun,
  CloudRain,
  Zap,
  Leaf,
  Heart,
  Moon,
  ArrowUpCircle,
  Eclipse,
} from "lucide-react";
import { MOOD_CATEGORIES } from "@/lib/browse-categories";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sun,
  CloudRain,
  Zap,
  Leaf,
  Heart,
  Moon,
  ArrowUpCircle,
  Eclipse,
};

export default function BrowseByMood() {
  return (
    <section aria-label="Browse by mood" className="mb-16">
      <h3 className="mb-6 text-2xl font-bold text-foreground">
        Browse by Mood
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {MOOD_CATEGORIES.map((mood) => {
          const Icon = ICON_MAP[mood.icon];
          return (
            <Link
              key={mood.id}
              href={`/?q=${encodeURIComponent(mood.searchQuery)}`}
              className={`group relative flex h-32 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${mood.gradient} p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03] glass-card sm:h-36`}
            >
              <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/20" />
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                {Icon && <Icon size={20} className="text-white" aria-hidden="true" />}
              </div>
              <span className="relative z-10 text-sm font-bold text-white drop-shadow-md sm:text-base">
                {mood.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
