"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { Search, Mic, SlidersHorizontal, Loader2 } from "lucide-react";
import { addRecentSearch, getRecentSearches, clearRecentSearches, getLastSearch } from "@/lib/recent-searches";
import { RecentSearch } from "@/lib/types";
import SearchSuggestions from "./search/SearchSuggestions";
import InstantResults from "./search/InstantResults";
import AdvancedFilters from "./search/AdvancedFilters";

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

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

  // Pre-fill with last search on /search page when no ?q= param
  useEffect(() => {
    if (pathname === "/search" && !searchParams.get("q")) {
      const lastSearch = getLastSearch();
      if (lastSearch) {
        setQuery(lastSearch);
      }
    }
  }, [pathname, searchParams]);

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
      router.push(`/search?${params.toString()}`);
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
  function getItemIndex(sectionType: "recent" | "trending", indexInSection: number): number {
    if (sectionType === "recent") {
      return indexInSection;
    }
    // trending items come after recent items
    return recentSearches.length + indexInSection;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-3"
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
          {/* Keyboard shortcut hint and loading indicator */}
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden items-center gap-1.5 sm:inline-flex">
            {isFetching && (
              <Loader2
                size={14}
                className="animate-spin text-muted"
                aria-label="Loading suggestions"
              />
            )}
            <span className="flex items-center gap-0.5 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs text-muted">
              <span className="text-[10px]">&#8984;</span>K
            </span>
          </span>

          {dropdownVisible && (
            <div
              ref={dropdownRef}
              id="search-dropdown"
              className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl glass-dropdown border-t border-t-white/10 animate-scale-in"
              role="listbox"
            >
              {/* Instant results when typing */}
              {query.trim().length > 0 && (
                <InstantResults
                  suggestions={suggestions}
                  activeIndex={activeIndex}
                  isFetching={isFetching}
                  onSuggestionClick={handleSuggestionClick}
                />
              )}

              {/* Search suggestions when empty */}
              {!query.trim() && (
                <SearchSuggestions
                  recentSearches={recentSearches}
                  trendingSearches={TRENDING_SEARCHES}
                  activeIndex={activeIndex}
                  onRecentClick={handleRecentClick}
                  onTrendingClick={handleTrendingClick}
                  onClearRecent={handleClearRecent}
                  getItemIndex={getItemIndex}
                />
              )}
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`cursor-pointer rounded-2xl p-4 transition-all ${
            showAdvancedFilters
              ? "bg-foreground text-background"
              : "border border-border text-muted hover:text-foreground hover:border-foreground/30"
          }`}
          aria-label={showAdvancedFilters ? "Hide advanced filters" : "Show advanced filters"}
          aria-expanded={showAdvancedFilters}
          title="Advanced filters"
        >
          <SlidersHorizontal size={20} aria-hidden="true" />
        </button>

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

      {/* Advanced Filters Panel */}
      <AdvancedFilters isOpen={showAdvancedFilters} />
    </div>
  );
}
