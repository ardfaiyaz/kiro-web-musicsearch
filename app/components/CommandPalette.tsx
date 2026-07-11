"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  ArrowRight,
  Moon,
  Sun,
  Home,
  Compass,
  BarChart3,
  ListMusic,
  Heart,
  Clock,
  X,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { getRecentSearches } from "@/lib/recent-searches";

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Search;
  description: string;
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        id: "home",
        label: "Go to Home",
        icon: Home,
        description: "Navigate to the homepage",
        action: () => {
          router.push("/");
          setIsOpen(false);
        },
      },
      {
        id: "discover",
        label: "Go to Discover",
        icon: Compass,
        description: "Explore trending music",
        action: () => {
          router.push("/discover");
          setIsOpen(false);
        },
      },
      {
        id: "dashboard",
        label: "Go to Dashboard",
        icon: BarChart3,
        description: "View your dashboard",
        action: () => {
          router.push("/dashboard");
          setIsOpen(false);
        },
      },
      {
        id: "playlists",
        label: "Go to Playlists",
        icon: ListMusic,
        description: "Manage your playlists",
        action: () => {
          router.push("/playlists");
          setIsOpen(false);
        },
      },
      {
        id: "favorites",
        label: "Go to Favorites",
        icon: Heart,
        description: "View your favorites",
        action: () => {
          router.push("/favorites");
          setIsOpen(false);
        },
      },
      {
        id: "toggle-theme",
        label:
          theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        icon: theme === "dark" ? Sun : Moon,
        description: "Toggle the color theme",
        action: () => {
          toggleTheme();
          setIsOpen(false);
        },
      },
    ],
    [router, theme, toggleTheme]
  );

  // Filter actions and recent searches based on query
  const filteredActions = query
    ? quickActions.filter(
        (action) =>
          action.label.toLowerCase().includes(query.toLowerCase()) ||
          action.description.toLowerCase().includes(query.toLowerCase())
      )
    : quickActions;

  const filteredRecent = query
    ? recentSearches.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    : recentSearches;

  const totalItems = filteredRecent.length + filteredActions.length + (query ? 1 : 0);

  // Open/close handler
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setActiveIndex(0);
    setRecentSearches(getRecentSearches().map((s) => s.query));
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  // Keyboard shortcut to open (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, open, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to wait for the animation
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  function executeItem(index: number) {
    // If query exists, first item is the search action
    let currentIndex = index;

    if (query && currentIndex === 0) {
      router.push(`/?q=${encodeURIComponent(query)}`);
      close();
      return;
    }

    if (query) {
      currentIndex -= 1;
    }

    // Recent searches
    if (currentIndex < filteredRecent.length) {
      router.push(`/?q=${encodeURIComponent(filteredRecent[currentIndex])}`);
      close();
      return;
    }

    currentIndex -= filteredRecent.length;

    // Quick actions
    if (currentIndex < filteredActions.length) {
      filteredActions[currentIndex].action();
      return;
    }
  }

  // Handle navigation within the palette
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % totalItems);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      executeItem(activeIndex);
      return;
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      );
      activeElement?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  let itemIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        className="glass-heavy relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-border/50 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search or type a command..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
            aria-label="Command palette search"
            aria-activedescendant={`palette-item-${activeIndex}`}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
          />
          <button
            onClick={close}
            className="shrink-0 rounded-md p-1 text-muted transition-premium hover:text-foreground"
            aria-label="Close command palette"
          >
            <X size={16} aria-hidden="true" />
          </button>
          <kbd className="hidden shrink-0 rounded-md border border-border bg-background/50 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline-block">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="palette-list"
          role="listbox"
          className="max-h-80 overflow-y-auto p-2"
        >
          {/* Search action (visible when query exists) */}
          {query && (
            <button
              data-index={itemIndex}
              id={`palette-item-${itemIndex}`}
              role="option"
              aria-selected={activeIndex === itemIndex++}
              onClick={() => {
                router.push(`/?q=${encodeURIComponent(query)}`);
                close();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-premium ${
                activeIndex === itemIndex - 1
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <Search size={16} aria-hidden="true" />
              <span className="flex-1">
                Search for &ldquo;{query}&rdquo;
              </span>
              <ArrowRight size={14} className="opacity-50" aria-hidden="true" />
            </button>
          )}

          {/* Recent Searches */}
          {filteredRecent.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                Recent Searches
              </p>
              {filteredRecent.map((search) => {
                const currentItemIndex = itemIndex++;
                return (
                  <button
                    key={search}
                    data-index={currentItemIndex}
                    id={`palette-item-${currentItemIndex}`}
                    role="option"
                    aria-selected={activeIndex === currentItemIndex}
                    onClick={() => {
                      router.push(`/?q=${encodeURIComponent(search)}`);
                      close();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-premium ${
                      activeIndex === currentItemIndex
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <Clock size={14} aria-hidden="true" />
                    <span className="flex-1 truncate">{search}</span>
                    <ArrowRight size={14} className="opacity-50" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                Quick Actions
              </p>
              {filteredActions.map((action) => {
                const currentItemIndex = itemIndex++;
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    data-index={currentItemIndex}
                    id={`palette-item-${currentItemIndex}`}
                    role="option"
                    aria-selected={activeIndex === currentItemIndex}
                    onClick={() => action.action()}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-premium ${
                      activeIndex === currentItemIndex
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="flex-1">{action.label}</span>
                    <span className="text-xs opacity-50">{action.description}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {totalItems === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No results found
            </p>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-border/50 px-4 py-2.5">
          <div className="flex items-center gap-1 text-[11px] text-muted">
            <kbd className="rounded border border-border bg-background/50 px-1 py-0.5 font-mono text-[10px]">
              &uarr;
            </kbd>
            <kbd className="rounded border border-border bg-background/50 px-1 py-0.5 font-mono text-[10px]">
              &darr;
            </kbd>
            <span className="ml-1">Navigate</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted">
            <kbd className="rounded border border-border bg-background/50 px-1 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>
            <span className="ml-1">Select</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted">
            <Command size={10} aria-hidden="true" />
            <kbd className="rounded border border-border bg-background/50 px-1 py-0.5 font-mono text-[10px]">
              K
            </kbd>
            <span className="ml-1">Toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
