import Link from "next/link";
import { Sparkles } from "lucide-react";

interface EditorialPick {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  query: string;
  gradient: string;
}

const EDITORIAL_PICKS: EditorialPick[] = [
  {
    id: "best-of-2024",
    title: "Best of 2024",
    subtitle: "The defining tracks of the year",
    description:
      "A curated collection of the most impactful and memorable songs released this year.",
    query: "Best of 2024",
    gradient: "from-violet-500 to-purple-700",
  },
  {
    id: "indie-essentials",
    title: "Indie Essentials",
    subtitle: "Underground gems and indie favorites",
    description:
      "Discover the best independent music from emerging and established artists.",
    query: "Indie Essentials",
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    id: "late-night-vibes",
    title: "Late Night Vibes",
    subtitle: "Smooth sounds for after hours",
    description:
      "Wind down with atmospheric tracks perfect for quiet late-night listening.",
    query: "Late Night Vibes",
    gradient: "from-blue-500 to-indigo-700",
  },
  {
    id: "feel-good-classics",
    title: "Feel Good Classics",
    subtitle: "Timeless tracks to lift your mood",
    description:
      "Iconic songs that never fail to put a smile on your face, spanning decades of music.",
    query: "Feel Good Classics",
    gradient: "from-orange-500 to-red-700",
  },
];

export default function EditorialPicks() {
  return (
    <section
      className="animate-on-scroll-slide-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Editorial picks"
    >
      <div className="mb-8 flex items-center gap-3">
        <Sparkles size={24} className="text-secondary" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
          Editorial Picks
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {EDITORIAL_PICKS.map((pick) => (
          <Link
            key={pick.id}
            href={`/?q=${encodeURIComponent(pick.query)}`}
            className="group relative overflow-hidden rounded-2xl p-8 transition-premium hover:-translate-y-1 hover:shadow-xl sm:p-10"
            aria-label={`${pick.title} - ${pick.subtitle}`}
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${pick.gradient} opacity-90`}
              aria-hidden="true"
            />
            {/* Glass-heavy overlay */}
            <div
              className="absolute inset-0 glass-heavy opacity-20"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-3">
              <h4 className="text-lg font-bold text-white sm:text-xl">
                {pick.title}
              </h4>
              <p className="text-sm text-white/80">{pick.subtitle}</p>
              <p className="mt-2 max-h-0 overflow-hidden text-xs text-white/60 transition-all duration-300 group-hover:max-h-20 group-hover:opacity-100 opacity-0">
                {pick.description}
              </p>
              <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-premium group-hover:bg-white/30">
                Explore
                <svg
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
