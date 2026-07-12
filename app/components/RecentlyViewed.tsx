"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, User, Disc3 } from "lucide-react";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed";

const STORAGE_KEY = "music-recently-viewed";
const EMPTY_ARRAY: RecentlyViewedItem[] = [];
let cachedRawString: string | null = null;
let cachedItems: RecentlyViewedItem[] = EMPTY_ARRAY;

function subscribe(callback: () => void) {
  // Listen for storage events (cross-tab) and custom events (same-tab)
  window.addEventListener("storage", callback);
  window.addEventListener("recently-viewed-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("recently-viewed-updated", callback);
  };
}

function getSnapshot(): RecentlyViewedItem[] {
  const rawString = localStorage.getItem(STORAGE_KEY);
  // Compare the raw string to avoid parsing + double JSON.stringify on every render
  if (rawString === cachedRawString) {
    return cachedItems;
  }
  cachedRawString = rawString;
  cachedItems = getRecentlyViewed();
  return cachedItems;
}

function getServerSnapshot(): RecentlyViewedItem[] {
  return EMPTY_ARRAY;
}

export default function RecentlyViewed() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (items.length === 0) return null;

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-label="Recently viewed"
    >
      <div className="mb-5 flex items-center gap-2">
        <Clock size={18} className="text-muted" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          Recently Viewed
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={`/${item.type}/${item.id}`}
            className="group flex-shrink-0"
          >
            <div className="flex w-28 flex-col items-center gap-2 sm:w-32">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/50 transition-transform duration-200 group-hover:scale-105">
                {item.artwork ? (
                  <Image
                    src={item.artwork}
                    alt={item.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface">
                    {item.type === "artist" ? (
                      <User size={32} className="text-muted" aria-hidden="true" />
                    ) : (
                      <Disc3 size={32} className="text-muted" aria-hidden="true" />
                    )}
                  </div>
                )}
              </div>
              <span className="w-full truncate text-center text-xs font-medium text-foreground sm:text-sm">
                {item.name}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted">
                {item.type}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
