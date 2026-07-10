"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  showBack?: boolean;
}

export default function Header({ showBack = false }: HeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between" aria-label="Main navigation">
          <div className="flex items-center gap-4">
            {showBack && (
              <Link
                href="/"
                className="flex items-center gap-2 text-muted transition-colors hover:text-foreground"
                aria-label="Back to search"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </Link>
            )}
            <h1 className="text-lg font-bold text-foreground sm:text-xl">
              <Link href="/" className="hover:text-accent transition-colors">
                Music Search &amp; Discovery
              </Link>
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                isActive("/") && !isActive("/discover") && !isActive("/favorites") && !isActive("/dashboard") && !isActive("/playlists")
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </Link>
            <Link
              href="/discover"
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                isActive("/discover")
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
              <span className="hidden sm:inline">Discover</span>
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                isActive("/dashboard")
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
                />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/playlists"
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                isActive("/playlists")
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                />
              </svg>
              <span className="hidden sm:inline">Playlists</span>
            </Link>
            <Link
              href="/favorites"
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                isActive("/favorites")
                  ? "text-red-500"
                  : "text-muted hover:text-red-500"
              }`}
              aria-label="Favorites"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill={isActive("/favorites") ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 8.25c0-3.15-2.7-5.25-5.437-5.25A5.5 5.5 0 0012 5.052 5.5 5.5 0 007.688 3C4.95 3 2.25 5.1 2.25 8.25c0 7.22 9.75 12.75 9.75 12.75s9.75-5.53 9.75-12.75z"
                />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
