import Link from "next/link";
import { Home, Compass, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:py-24">
      {/* Dynamic gradient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="animate-slide-up">
        {/* Animated music note SVG illustration */}
        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-primary/5 sm:h-40 sm:w-40">
          <svg
            className="h-16 w-16 text-primary sm:h-20 sm:w-20"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Music note with broken connection */}
            <circle cx="24" cy="58" r="10" fill="currentColor" opacity="0.3" />
            <circle cx="56" cy="50" r="10" fill="currentColor" opacity="0.3" />
            <path
              d="M34 58V20L66 12V50"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 4"
              opacity="0.6"
            />
            {/* X mark overlay */}
            <path
              d="M30 30L50 50M50 30L30 50"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>

        <p className="text-6xl font-bold tracking-tight text-foreground sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Track Not Found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted sm:text-lg">
          Looks like this track skipped off the playlist. The page you are
          looking for does not exist or has been moved.
        </p>
      </div>

      {/* Search suggestion */}
      <div className="w-full max-w-sm animate-fade-in">
        <p className="mb-3 text-sm font-medium text-muted">
          Try searching for something:
        </p>
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-2xl glass-card p-4 transition-premium hover:border-foreground/10 hover:shadow-lg"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search size={18} aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-muted transition-premium group-hover:text-foreground">
            Search for music, artists, or albums...
          </span>
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-wrap items-center justify-center gap-3" aria-label="Quick navigation">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-premium hover:bg-foreground/80"
        >
          <Home size={16} aria-hidden="true" />
          Go Home
        </Link>
        <Link
          href="/discover"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-premium hover:bg-foreground/5"
        >
          <Compass size={16} aria-hidden="true" />
          Discover Music
        </Link>
      </nav>
    </div>
  );
}
