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
                isActive("/") && !isActive("/discover") && !isActive("/favorites")
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
