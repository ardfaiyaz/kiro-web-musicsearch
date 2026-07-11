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
import Image from "next/image";
import { Search, Mic, Clock, TrendingUp, Music, User, Disc3 } from "lucide-react";
import { addRecentSearch, getRecentSearches, clearRecentSearches } from "@/lib/recent-searches";
import { RecentSearch } from "@/lib/types";

interface Suggestion {
  trackId: number;
  trackName: string;
  artistName: string;
  type: "track" | "artist" | "album";
  imageUrl?: string;
  albumName?: string;
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

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  track: "bg-primary/10 text-primary border-primary/20",
  artist: "bg-secondary/10 text-secondary border-secondary/20",
  album: "bg-info/10 text-info border-info/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  track: "Song",
  artist: "Artist",
  album: "Album",
};

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
  const [isFetching, setIsFetching] = useState(false);

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

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleGlobalKeydown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleGlobalKeydown);
    return () => document.removeEventListener("keydown", handleGlobalKeydown);
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
    setIsFetching(true);

    try {
      // Only fetch Spotify artist suggestions when query is 3+ characters
      // to reduce quota pressure for very short/generic queries
      const shouldFetchSpotify = term.trim().length >= 3;

      const [itunesRes, spotifyRes] = await Promise.allSettled([
        fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=musicTrack&limit=4`,
          { signal: controller.signal }
        ),
        shouldFetchSpotify
          ? fetch(
              `/api/spotify/artist?name=${encodeURIComponent(term)}`,
              { signal: controller.signal }
            )
          : Promise.resolve(null),
      ]);

      const results: Suggestion[] = [];

      // Add Spotify artist suggestion if available
      if (
        spotifyRes.status === "fulfilled" &&
        spotifyRes.value &&
        spotifyRes.value.ok
      ) {
        const spotifyData = await spotifyRes.value.json();
        if (spotifyData.artist) {
          results.push({
            trackId: -1,
            trackName: spotifyData.artist.name,
            artistName: spotifyData.artist.name,
            type: "artist",
            imageUrl: spotifyData.artist.images?.[0]?.url ?? undefined,
          });
        }
      }

      // Add iTunes track suggestions
      if (itunesRes.status === "fulfilled" && itunesRes.value.ok) {
        const data = await itunesRes.value.json();
        const tracks: Suggestion[] = data.results
          .filter((r: { wrapperType: string }) => r.wrapperType === "track")
          .slice(0, 4)
          .map(
            (r: {
              trackId: number;
              trackName: string;
              artistName: string;
              artworkUrl100?: string;
              collectionName?: string;
            }) => ({
              trackId: r.trackId,
              trackName: r.trackName,
              artistName: r.artistName,
              type: "track" as const,
              imageUrl: r.artworkUrl100 ?? undefined,
              albumName: r.collectionName ?? undefined,
            })
          );
        results.push(...tracks);
      }

      setSuggestions(results.slice(0, 6));
      setActiveIndex(-1);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    } finally {
      setIsFetching(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(true);
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
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
    const term = suggestion.type === "artist"
      ? suggestion.artistName
      : `${suggestion.trackName} ${suggestion.artistName}`;
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
        const value = s.type === "artist" ? s.artistName : `${s.trackName} ${s.artistName}`;
        items.push({ type: "suggestion", value, data: s });
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

  const showSuggestions = showDropdown && query.trim().length > 0 && suggestions.length > 0;
  const showRecent = showDropdown && query.trim().length === 0 && recentSearches.length > 0;
  const showTrending = showDropdown && query.trim().length === 0;
  const showShimmer = showDropdown && query.trim().length > 0 && isFetching && suggestions.length === 0;
  const dropdownVisible = showSuggestions || showRecent || showTrending || showShimmer;

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
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search songs, artists, or albums..."
          maxLength={200}
          className="w-full rounded-2xl glass-search py-4 pl-12 pr-20 text-base text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          aria-label="Search music"
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={dropdownVisible}
          aria-controls="search-dropdown"
          aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
        />
        {/* Keyboard shortcut hint */}
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden items-center gap-0.5 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs text-muted sm:inline-flex">
          <span className="text-[10px]">&#8984;</span>K
        </span>

        {dropdownVisible && (
          <div
            ref={dropdownRef}
            id="search-dropdown"
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl glass-dropdown border-t border-t-white/10 animate-scale-in"
            role="listbox"
          >
            {/* Loading shimmer */}
            {showShimmer && (
              <div className="px-5 py-3" aria-busy="true" aria-label="Loading suggestions">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <div className="h-9 w-9 rounded-lg shimmer-wave" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="h-3.5 w-3/4 rounded shimmer-wave" />
                      <div className="h-2.5 w-1/2 rounded shimmer-wave" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions with artwork and badges */}
            {showSuggestions && (
              <>
                {/* Top result highlight */}
                {suggestions.length > 0 && (
                  <div className="border-b border-border px-5 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                      Top Result
                    </span>
                  </div>
                )}
                {suggestions.map((s, idx) => (
                  <button
                    key={`${s.type}-${s.trackId}-${idx}`}
                    id={`search-item-${idx}`}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
                      activeIndex === idx ? "bg-foreground/10" : ""
                    } ${idx === 0 ? "bg-foreground/[0.03]" : ""}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                  >
                    {/* Artwork thumbnail */}
                    {s.imageUrl ? (
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-border">
                        <Image
                          src={s.imageUrl}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                        {s.type === "artist" ? (
                          <User size={14} className="text-muted" aria-hidden="true" />
                        ) : s.type === "album" ? (
                          <Disc3 size={14} className="text-muted" aria-hidden="true" />
                        ) : (
                          <Music size={14} className="text-muted" aria-hidden="true" />
                        )}
                      </span>
                    )}

                    {/* Text content */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate font-medium text-sm">
                        {s.type === "artist" ? s.artistName : s.trackName}
                      </span>
                      {s.type !== "artist" && (
                        <span className="truncate text-xs text-muted">{s.artistName}</span>
                      )}
                    </div>

                    {/* Category badge */}
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_BADGE_STYLES[s.type]}`}
                    >
                      {CATEGORY_LABELS[s.type]}
                    </span>
                  </button>
                ))}
              </>
            )}

            {!query.trim() && (
              <>
                {showRecent && (
                  <>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-muted" aria-hidden="true" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted">
                          Recent Searches
                        </span>
                      </div>
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
                        className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
                          activeIndex === getItemIndex("recent", idx) ? "bg-foreground/10" : ""
                        }`}
                        role="option"
                        aria-selected={activeIndex === getItemIndex("recent", idx)}
                      >
                        <Clock size={14} className="shrink-0 text-muted" aria-hidden="true" />
                        <span className="truncate">{r.query}</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Trending Searches */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                  <TrendingUp size={12} className="text-muted" aria-hidden="true" />
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
                    className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
                      activeIndex === getItemIndex("trending", idx) ? "bg-foreground/10" : ""
                    }`}
                    role="option"
                    aria-selected={activeIndex === getItemIndex("trending", idx)}
                  >
                    <TrendingUp size={14} className="shrink-0 text-muted/70" aria-hidden="true" />
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
          <Mic size={20} aria-hidden="true" />
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
