"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "top-songs", label: "Top Songs" },
  { id: "discography", label: "Discography" },
  { id: "similar-artists", label: "Similar Artists" },
  { id: "videos", label: "Videos" },
  { id: "about", label: "About" },
] as const;

function useScrollPosition() {
  const subscribe = (callback: () => void) => {
    window.addEventListener("scroll", callback, { passive: true });
    return () => window.removeEventListener("scroll", callback);
  };
  const getSnapshot = () => window.scrollY;
  const getServerSnapshot = () => 0;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function ArtistNav() {
  const scrollY = useScrollPosition();
  const [activeSection, setActiveSection] = useState<string>("overview");
  const isVisible = scrollY > 500;

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => ({
      id: item.id,
      element: document.getElementById(item.id),
    }));

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element && section.element.offsetTop <= scrollPos) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`sticky top-[57px] z-40 transition-all duration-300 ${
        isVisible
          ? "glass-medium border-b border-border/30 opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none"
      }`}
      aria-label="Artist page navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-premium hover:text-foreground hover:bg-surface"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-premium ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
              aria-label={`Navigate to ${item.label} section`}
              aria-current={activeSection === item.id ? "true" : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
