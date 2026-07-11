"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Compass, BarChart3, ListMusic, Heart, ChevronLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useDynamicColors } from "./DynamicColorProvider";

interface HeaderProps {
  showBack?: boolean;
}

export default function Header({ showBack = false }: HeaderProps) {
  const pathname = usePathname();
  const { colors } = useDynamicColors();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="glass-elevated sticky top-0 z-50 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <nav
          className="flex items-center justify-between"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-5">
            {showBack && (
              <Link
                href="/"
                className="flex items-center gap-2 text-muted transition-premium hover:text-foreground"
                aria-label="Back to search"
              >
                <ChevronLeft size={20} aria-hidden="true" />
                <span className="text-sm font-medium hidden sm:inline">
                  Back
                </span>
              </Link>
            )}
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              <Link
                href="/"
                className="transition-premium hover:opacity-70"
              >
                Music
              </Link>
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
                isActive("/") &&
                !isActive("/discover") &&
                !isActive("/favorites") &&
                !isActive("/dashboard") &&
                !isActive("/playlists")
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={
                isActive("/") &&
                !isActive("/discover") &&
                !isActive("/favorites") &&
                !isActive("/dashboard") &&
                !isActive("/playlists") &&
                colors
                  ? { backgroundColor: `color-mix(in srgb, ${colors.dominant} 15%, transparent)` }
                  : undefined
              }
            >
              <Search size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            <Link
              href="/discover"
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
                isActive("/discover")
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={
                isActive("/discover") && colors
                  ? { backgroundColor: `color-mix(in srgb, ${colors.dominant} 15%, transparent)` }
                  : undefined
              }
            >
              <Compass size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Discover</span>
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
                isActive("/dashboard")
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={
                isActive("/dashboard") && colors
                  ? { backgroundColor: `color-mix(in srgb, ${colors.dominant} 15%, transparent)` }
                  : undefined
              }
            >
              <BarChart3 size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/playlists"
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
                isActive("/playlists")
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={
                isActive("/playlists") && colors
                  ? { backgroundColor: `color-mix(in srgb, ${colors.dominant} 15%, transparent)` }
                  : undefined
              }
            >
              <ListMusic size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Playlists</span>
            </Link>
            <Link
              href="/favorites"
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
                isActive("/favorites")
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={
                isActive("/favorites") && colors
                  ? { backgroundColor: `color-mix(in srgb, ${colors.dominant} 15%, transparent)` }
                  : undefined
              }
              aria-label="Favorites"
            >
              <Heart
                size={16}
                fill={isActive("/favorites") ? "currentColor" : "none"}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Favorites</span>
            </Link>
            <div className="ml-2 border-l border-border/50 pl-2">
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
