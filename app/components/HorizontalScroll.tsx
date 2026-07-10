"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export default function HorizontalScroll({
  children,
  className = "",
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll, { passive: true });
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={`group relative ${className}`}>
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Scroll left"
        >
          <svg
            className="h-5 w-5 text-foreground"
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
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2 -mb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Scroll right"
        >
          <svg
            className="h-5 w-5 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
