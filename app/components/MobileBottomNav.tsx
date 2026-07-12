"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Compass, Heart, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/search") {
      return pathname === "/search" || pathname.startsWith("/search?");
    }
    return pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass-heavy border-t border-border/50 sm:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors ${
                active
                  ? "text-[var(--primary)]"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon
                size={20}
                fill={active && label === "Favorites" ? "currentColor" : "none"}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
