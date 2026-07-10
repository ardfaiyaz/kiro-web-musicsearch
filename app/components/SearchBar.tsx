"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useState,
  useEffect,
  useRef,
  useTransition,
  useCallback,
  useSyncExternalStore,
  FormEvent,
  KeyboardEvent,
} from "react";
import { addRecentSearch, getRecentSearches, clearRecentSearches } from "@/lib/recent-searches";
import { RecentSearch } from "@/lib/types";

interface Suggestion {
  trackId: number;
  trackName: string;
  artistName: string;
}

const TRENDING_SEARCHES = [
  "Taylor Swift",
  "Drake",
  "BTS",
  "Billie Eilish",
  "The Weeknd",
];

function getSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function subscribeSpeech(callback: () => void) {
  void callback;
  return () => {};
}

function getServerSnapshot(): boolean {
  return false;
}

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const speechSupported = useSyncExternalStore(
    subscribeSpeech,
    getSpeechSupported,
    getServerSnapshot
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=musicTrack&limit=5`,
        { signal: controller.signal }
      );
      if (!res.ok) return;
      const data = await res.json();
      const results: Suggestion[] = data.results
        .filter((r: { wrapperType: string }) => r.wrapperType === "track")
        .slice(0, 5)
        .map((r: { trackId: number; trackName: string; artistName: string }) => ({
          trackId: r.trackId,
          trackName: r.trackName,
          artistName: r.artistName,
        }));
      setSuggestions(results);
      setActiveIndex(-1);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(true);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
      setShowDropdown(true);
    }, 300);
  }

  function handleFocus() {
    setRecentSearches(getRecentSearches());
    setShowDropdown(true);
    setActiveIndex(-1);
  }

  function performSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    setRecentSearches(getRecentSearches());
    setShowDropdown(false);
    setActiveIndex(-1);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", trimmed);
      router.push(`/?${params.toString()}`);
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    performSearch(query);
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    const term = `${suggestion.trackName} ${suggestion.artistName}`;
    setQuery(term);
    performSearch(term);
  }

  function handleRecentClick(recent: RecentSearch) {
    setQuery(recent.query);
    performSearch(recent.query);
  }

  function handleTrendingClick(term: string) {
    setQuery(term);
    performSearch(term);
  }

  function handleClearRecent() {
    clearRecentSearches();
    setRecentSearches([]);
  }

  // Build flat list of all navigable items for keyboard navigation
  function getDropdownItems(): { type: "suggestion" | "recent" | "trending"; value: string; data?: Suggestion | RecentSearch }[] {
    const items: { type: "suggestion" | "recent" | "trending"; value: string; data?: Suggestion | RecentSearch }[] = [];

    if (query.trim() && suggestions.length > 0) {
      suggestions.forEach((s) => {
        items.push({ type: "suggestion", value: `${s.trackName} ${s.artistName}`, data: s });
      });
    } else if (!query.trim()) {
      recentSearches.forEach((r) => {
        items.push({ type: "recent", value: r.query, data: r });
      });
      TRENDING_SEARCHES.forEach((term) => {
        items.push({ type: "trending", value: term });
      });
    }

    return items;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return;

    const items = getDropdownItems();
    const totalItems = items.length;

    if (totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = items[activeIndex];
      if (item.type === "suggestion") {
        handleSuggestionClick(item.data as Suggestion);
      } else if (item.type === "recent") {
        handleRecentClick(item.data as RecentSearch);
      } else if (item.type === "trending") {
        handleTrendingClick(item.value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  }

  function startVoiceSearch() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      performSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopVoiceSearch() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  const showSuggestions = showDropdown && query.trim() && suggestions.length > 0;
  const showRecent = showDropdown && !query.trim() && recentSearches.length > 0;
  const showTrending = showDropdown && !query.trim();
  const dropdownVisible = showSuggestions || showRecent || showTrending;

  // Calculate offset for active index in the combined list
  function getItemIndex(sectionType: "suggestion" | "recent" | "trending", indexInSection: number): number {
    if (sectionType === "suggestion") {
      return indexInSection;
    }
    if (sectionType === "recent") {
      return indexInSection;
    }
    // trending items come after recent items
    return recentSearches.length + indexInSection;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl items-center gap-3"
      role="search"
    >
      <div className="relative flex-1">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search songs, artists, or albums..."
          maxLength={200}
          className="w-full rounded-2xl glass-search py-4 pl-12 pr-16 text-base text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          aria-label="Search music"
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={dropdownVisible}
          aria-controls="search-dropdown"
          aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted sm:inline">
          /
        </span>

        {dropdownVisible && (
          <div
            ref={dropdownRef}
            id="search-dropdown"
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl glass-dropdown border-t border-t-white/10 animate-scale-in"
            role="listbox"
          >
            {showSuggestions &&
              suggestions.map((s, idx) => (
                <button
                  key={s.trackId}
                  id={`search-item-${idx}`}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className={`flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
                    activeIndex === idx ? "bg-foreground/10" : ""
                  }`}
                  role="option"
                  aria-selected={activeIndex === idx}
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="truncate font-medium">{s.trackName}</span>
                  <span className="truncate text-muted">- {s.artistName}</span>
                </button>
              ))}

            {!query.trim() && (
              <>
                {showRecent && (
                  <>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted">
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={handleClearRecent}
                        className="text-xs text-muted transition-colors hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((r, idx) => (
                      <button
                        key={r.timestamp}
                        id={`search-item-${getItemIndex("recent", idx)}`}
                        type="button"
                        onClick={() => handleRecentClick(r)}
                        className={`flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
                          activeIndex === getItemIndex("recent", idx) ? "bg-foreground/10" : ""
                        }`}
                        role="option"
                        aria-selected={activeIndex === getItemIndex("recent", idx)}
                      >
                        <svg
                          className="h-4 w-4 shrink-0 text-muted"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="truncate">{r.query}</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Trending Searches */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                  <svg
                    className="h-4 w-4 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted">
                    Trending Searches
                  </span>
                </div>
                {TRENDING_SEARCHES.map((term, idx) => (
                  <button
                    key={term}
                    id={`search-item-${getItemIndex("trending", idx)}`}
                    type="button"
                    onClick={() => handleTrendingClick(term)}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
                      activeIndex === getItemIndex("trending", idx) ? "bg-foreground/10" : ""
                    }`}
                    role="option"
                    aria-selected={activeIndex === getItemIndex("trending", idx)}
                  >
                    <svg
                      className="h-4 w-4 shrink-0 text-muted/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z"
                      />
                    </svg>
                    <span className="truncate">{term}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {speechSupported && (
        <button
          type="button"
          onClick={isListening ? stopVoiceSearch : startVoiceSearch}
          className={`cursor-pointer rounded-2xl p-4 transition-all ${
            isListening
              ? "bg-foreground text-background animate-pulse"
              : "border border-border text-muted hover:text-foreground hover:border-foreground/30"
          }`}
          aria-label={isListening ? "Stop voice search" : "Start voice search"}
          title={isListening ? "Stop listening" : "Voice search"}
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
              strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3z"
            />
          </svg>
        </button>
      )}

      <button
        type="submit"
        disabled={isPending || !query.trim()}
        className="cursor-pointer rounded-2xl bg-foreground px-7 py-4 text-base font-medium text-background transition-all hover:bg-foreground/80 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="hidden sm:inline">Searching</span>
          </span>
        ) : (
          "Search"
        )}
      </button>
    </form>
  );
}
