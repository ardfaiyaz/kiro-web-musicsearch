"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Compass, BarChart3, ListMusic, Heart, ChevronLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useDynamicColors } from "./DynamicColorProvider";

function useScrollPosition() {
  const subscribe = (callback: () => void) => {
    window.addEventListener("scroll", callback, { passive: true });
    return () => window.removeEventListener("scroll", callback);
  };
  const getSnapshot = () => window.scrollY;
  const getServerSnapshot = () => 0;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

interface HeaderProps {
  showBack?: boolean;
}

export default function Header({ showBack = false }: HeaderProps) {
  const pathname = usePathname();
  const { colors } = useDynamicColors();
  const scrollY = useScrollPosition();

  const isHomepage = pathname === "/";
  const scrolled = !isHomepage || scrollY > 50;

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "glass-elevated border-border/50"
          : "border-transparent bg-transparent"
      }`}
    >
      {/* Brand gradient accent line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <nav
          id="main-navigation"
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
              href="/search"
              aria-current={
                isActive("/search")
                  ? "page"
                  : undefined
              }
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
                isActive("/search")
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={
                isActive("/search") && colors
                  ? { backgroundColor: `color-mix(in srgb, ${colors.dominant} 15%, transparent)` }
                  : undefined
              }
            >
              <Search size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            <Link
              href="/discover"
              aria-current={isActive("/discover") ? "page" : undefined}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
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
              aria-current={isActive("/dashboard") ? "page" : undefined}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
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
              aria-current={isActive("/playlists") ? "page" : undefined}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
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
              aria-current={isActive("/favorites") ? "page" : undefined}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-premium sm:px-4 ${
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
