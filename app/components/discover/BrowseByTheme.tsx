import Link from "next/link";
import {
  Sun,
  Snowflake,
  Car,
  PartyPopper,
  HeartCrack,
  Rewind,
} from "lucide-react";
import { THEME_CATEGORIES } from "@/lib/browse-categories";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sun,
  Snowflake,
  Car,
  PartyPopper,
  HeartCrack,
  Rewind,
};

export default function BrowseByTheme() {
  return (
    <section aria-label="Browse by theme" className="mb-16">
      <h3 className="mb-6 text-2xl font-bold text-foreground">
        Browse by Theme
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {THEME_CATEGORIES.map((theme) => {
          const Icon = ICON_MAP[theme.icon];
          return (
            <Link
              key={theme.id}
              href={`/?q=${encodeURIComponent(theme.searchQuery)}`}
              className={`group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} p-5 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03] glass-card aspect-square`}
            >
              <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/20" />
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                {Icon && <Icon size={20} className="text-white" aria-hidden="true" />}
              </div>
              <span className="relative z-10 text-sm font-bold text-white drop-shadow-md">
                {theme.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
