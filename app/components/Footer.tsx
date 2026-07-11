import Link from "next/link";
import { Music2, Code, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass-subtle border-t border-border/50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Music2 size={20} className="text-foreground" aria-hidden="true" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Music
            </span>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted transition-premium hover:text-foreground"
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-muted transition-premium hover:text-foreground"
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted transition-premium hover:text-foreground"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/playlists"
                  className="text-sm text-muted transition-premium hover:text-foreground"
                >
                  Playlists
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-sm text-muted transition-premium hover:text-foreground"
                >
                  Favorites
                </Link>
              </li>
            </ul>
          </nav>

          {/* External Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-premium hover:text-foreground"
              aria-label="GitHub"
            >
              <Code size={18} aria-hidden="true" />
            </a>
            <a
              href="https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-premium hover:text-foreground"
              aria-label="iTunes API documentation"
            >
              <ExternalLink size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-8 border-t border-border/30 pt-6 text-center">
          <p className="text-sm text-muted">
            Powered by iTunes, Spotify, Last.fm &amp; more
          </p>
        </div>
      </div>
    </footer>
  );
}
