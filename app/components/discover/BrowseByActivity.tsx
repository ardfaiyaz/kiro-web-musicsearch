import Link from "next/link";
import {
  Dumbbell,
  BookOpen,
  Moon,
  Train,
  ChefHat,
  Gamepad2,
  Wind,
} from "lucide-react";
import { ACTIVITY_CATEGORIES } from "@/lib/browse-categories";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Dumbbell,
  BookOpen,
  Moon,
  Train,
  ChefHat,
  Gamepad2,
  Wind,
};

export default function BrowseByActivity() {
  return (
    <section aria-label="Browse by activity" className="mb-16">
      <h3 className="mb-6 text-2xl font-bold text-foreground">
        Browse by Activity
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {ACTIVITY_CATEGORIES.map((activity) => {
          const Icon = ICON_MAP[activity.icon];
          return (
            <Link
              key={activity.id}
              href={`/?q=${encodeURIComponent(activity.searchQuery)}`}
              className={`group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${activity.gradient} p-5 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03] glass-card aspect-square`}
            >
              <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/20" />
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                {Icon && <Icon size={20} className="text-white" aria-hidden="true" />}
              </div>
              <span className="relative z-10 text-sm font-bold text-white drop-shadow-md">
                {activity.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
