"use client";

import { useState, useRef, useEffect } from "react";

interface ShareMenuProps {
  trackName?: string;
  artistName: string;
  albumName?: string;
  artworkUrl?: string;
  type: "track" | "artist" | "album";
}

export default function ShareMenu({
  trackName,
  artistName,
  albumName,
  artworkUrl,
  type,
}: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  function getShareText(): string {
    if (type === "track" && trackName) {
      return `${trackName} by ${artistName}${albumName ? ` from ${albumName}` : ""}`;
    }
    if (type === "album" && albumName) {
      return `${albumName} by ${artistName}`;
    }
    return artistName;
  }

  function getSearchQuery(): string {
    if (type === "track" && trackName) {
      return `${artistName} ${trackName}`;
    }
    if (type === "album" && albumName) {
      return `${artistName} ${albumName}`;
    }
    return artistName;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  function handleAppleMusic() {
    const query = encodeURIComponent(getSearchQuery());
    window.open(
      `https://music.apple.com/us/search?term=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
  }

  function handleYouTube() {
    const query = encodeURIComponent(getSearchQuery());
    window.open(
      `https://www.youtube.com/results?search_query=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
  }

  async function handleDownloadArtwork() {
    if (!artworkUrl) return;
    const highResUrl = artworkUrl.replace("100x100", "600x600");
    try {
      const response = await fetch(highResUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${getSearchQuery().replace(/\s+/g, "-")}-artwork.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in a new tab if fetch fails
      window.open(highResUrl, "_blank", "noopener,noreferrer");
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Share options"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-card border border-border text-muted transition-colors hover:text-foreground hover:border-foreground/30"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
        Share
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden glass-dropdown rounded-xl"
        >
          <button
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/10"
          >
            <svg
              className="h-4 w-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
              />
            </svg>
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          <button
            role="menuitem"
            onClick={handleAppleMusic}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/10"
          >
            <svg
              className="h-4 w-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
            Search on Apple Music
          </button>
          <button
            role="menuitem"
            onClick={handleYouTube}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/10"
          >
            <svg
              className="h-4 w-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
            Search on YouTube
          </button>
          {artworkUrl && (
            <button
              role="menuitem"
              onClick={handleDownloadArtwork}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/10"
            >
              <svg
                className="h-4 w-4 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download artwork
            </button>
          )}
        </div>
      )}
    </div>
  );
}
