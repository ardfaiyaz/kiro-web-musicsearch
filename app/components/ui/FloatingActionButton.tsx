"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Play, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAudioPlayer } from "../AudioPlayerContext";

/**
 * FloatingActionButton - a FAB fixed to bottom-right (above bottom nav on mobile)
 * with quick access to search and play actions. Expands on tap to show mini menu.
 */
export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isPlaying, pause, resume, currentlyPlayingId } = useAudioPlayer();

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSearch = useCallback(() => {
    router.push("/search");
    setIsOpen(false);
  }, [router]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
    setIsOpen(false);
  }, [isPlaying, pause, resume]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-center gap-2 sm:hidden"
    >
      {/* Main FAB button */}
      <button
        onClick={toggleMenu}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 active:scale-90 ${
          isOpen
            ? "bg-foreground/80 text-background rotate-45"
            : "bg-foreground text-background"
        }`}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <Plus size={22} />}
      </button>

      {/* Expandable menu items */}
      {isOpen && (
        <div
          className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="menu"
          aria-label="Quick actions"
        >
          {/* Search action */}
          <button
            onClick={handleSearch}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-md transition-all active:scale-90"
            role="menuitem"
            aria-label="Quick search"
          >
            <Search size={18} />
          </button>

          {/* Play/Pause action */}
          {currentlyPlayingId && (
            <button
              onClick={handlePlayPause}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shadow-md transition-all active:scale-90"
              role="menuitem"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <Play size={18} className={isPlaying ? "hidden" : ""} />
              {isPlaying && (
                <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
