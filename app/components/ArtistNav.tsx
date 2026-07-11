"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

export default function ArtistNav() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [isVisible, setIsVisible] = useState(false);
  const activeSectionRef = useRef<string>("overview");
  const isVisibleRef = useRef(false);

  const handleScroll = useCallback(() => {
    const scrollPos = window.scrollY;

    const nextVisible = scrollPos > 500;
    if (nextVisible !== isVisibleRef.current) {
      isVisibleRef.current = nextVisible;
      setIsVisible(nextVisible);
    }

    const offset = scrollPos + 200;
    let nextSection = "overview";
    for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
      const element = document.getElementById(NAV_ITEMS[i].id);
      if (element && element.offsetTop <= offset) {
        nextSection = NAV_ITEMS[i].id;
        break;
      }
    }

    if (nextSection !== activeSectionRef.current) {
      activeSectionRef.current = nextSection;
      setActiveSection(nextSection);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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
