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
} from "react";
import { addRecentSearch, getRecentSearches, clearRecentSearches } from "@/lib/recent-searches";
import { RecentSearch } from "@/lib/types";

interface Suggestion {
  trackId: number;
  trackName: string;
  artistName: string;
}

function getSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function subscribeSpeech(callback: () => void) {
  // Speech support doesn't change - no subscription needed
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

  const speechSupported = useSyncExternalStore(
    subscribeSpeech,
    getSpeechSupported,
    getServerSnapshot
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced autocomplete fetching
  const fetchSuggestions = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=musicTrack&limit=5`
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
    } catch {
      // Silently fail autocomplete
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
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
  }

  function performSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    setRecentSearches(getRecentSearches());
    setShowDropdown(false);
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

  function handleClearRecent() {
    clearRecentSearches();
    setRecentSearches([]);
  }

  // Voice search
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
  const showRecent =
    showDropdown && !query.trim() && recentSearches.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl items-center gap-2"
      role="search"
    >
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search songs, artists, or albums..."
          maxLength={200}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-16 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          aria-label="Search music"
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={showSuggestions || showRecent}
          aria-controls="search-dropdown"
        />
        {/* Keyboard shortcut hint */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-muted sm:inline">
          /
        </span>

        {/* Autocomplete / Recent dropdown */}
        {(showSuggestions || showRecent) && (
          <div
            ref={dropdownRef}
            id="search-dropdown"
            className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            role="listbox"
          >
            {showSuggestions &&
              suggestions.map((s) => (
                <button
                  key={s.trackId}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent/10"
                  role="option"
                  aria-selected={false}
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
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="truncate font-medium">{s.trackName}</span>
                  <span className="truncate text-muted">- {s.artistName}</span>
                </button>
              ))}

            {showRecent && (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <span className="text-xs font-medium text-muted">
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    className="text-xs text-accent transition-colors hover:text-accent-hover"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((r) => (
                  <button
                    key={r.timestamp}
                    type="button"
                    onClick={() => handleRecentClick(r)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent/10"
                    role="option"
                    aria-selected={false}
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
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="truncate">{r.query}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Voice search button */}
      {speechSupported && (
        <button
          type="button"
          onClick={isListening ? stopVoiceSearch : startVoiceSearch}
          className={`rounded-xl p-3 transition-colors ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "border border-border text-muted hover:text-foreground hover:bg-card"
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
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3z"
            />
          </svg>
        </button>
      )}

      <button
        type="submit"
        disabled={isPending || !query.trim()}
        className="rounded-xl bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
            Searching
          </span>
        ) : (
          "Search"
        )}
      </button>
    </form>
  );
}
