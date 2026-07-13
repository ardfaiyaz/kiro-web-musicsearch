"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTagsForTrack,
  addTagToTrack,
  removeTagFromTrack,
  getAllTags,
} from "@/lib/tags";

interface TagSystemProps {
  trackId: number;
  compact?: boolean;
}

export default function TagSystem({ trackId, compact = false }: TagSystemProps) {
  const [tags, setTags] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return getTagsForTrack(trackId);
  });
  const [allTags, setAllTags] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return getAllTags();
  });
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const refreshTags = useCallback(() => {
    setTags(getTagsForTrack(trackId));
    setAllTags(getAllTags());
  }, [trackId]);

  // Listen for cross-tab storage changes
  useEffect(() => {
    const handler = () => {
      setTags(getTagsForTrack(trackId));
      setAllTags(getAllTags());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [trackId]);

  function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    const tag = inputValue.trim().replace(/\s+/g, "-");
    if (!tag) return;
    addTagToTrack(tag, trackId);
    setInputValue("");
    setIsAdding(false);
    refreshTags();
  }

  function handleRemoveTag(tag: string) {
    removeTagFromTrack(tag, trackId);
    refreshTags();
  }

  function handleSuggestionClick(tag: string) {
    addTagToTrack(tag, trackId);
    setInputValue("");
    setIsAdding(false);
    refreshTags();
  }

  const suggestions = allTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(inputValue.toLowerCase())
  );

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-foreground">Tags</h4>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground transition-colors"
            aria-label="Add tag"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="group inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-muted transition-colors hover:bg-foreground/10"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-foreground/10"
                aria-label={`Remove tag ${tag}`}
              >
                <svg
                  className="h-2.5 w-2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="relative">
          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="#workout, #chill..."
              className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
              autoFocus
              aria-label="New tag"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20 disabled:opacity-40"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setInputValue("");
              }}
              className="rounded-lg bg-foreground/5 px-3 py-1.5 text-xs text-muted transition-colors hover:bg-foreground/10"
            >
              Cancel
            </button>
          </form>
          {inputValue && suggestions.length > 0 && (
            <div className="absolute top-full left-0 z-10 mt-1 max-h-32 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
              {suggestions.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSuggestionClick(tag)}
                  className="block w-full rounded px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-foreground/5"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tags.length === 0 && !isAdding && (
        <p className="text-xs text-muted">
          No tags yet. Add custom tags to organize your music.
        </p>
      )}
    </div>
  );
}
