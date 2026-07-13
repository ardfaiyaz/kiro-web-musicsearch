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

  function handleTwitterShare() {
    const text = encodeURIComponent(
      `Listening to ${getShareText()} \u266B`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
    setOpen(false);
  }

  function handleFacebookShare() {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
    setOpen(false);
  }

  function handleWhatsAppShare() {
    const text = encodeURIComponent(
      `Check out ${getShareText()} ${window.location.href}`
    );
    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
  }

  function handleRedditShare() {
    const title = encodeURIComponent(getShareText());
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.reddit.com/submit?title=${title}&url=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
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
          <div className="mx-4 my-1 border-t border-border" role="separator" />
          <button
            role="menuitem"
            onClick={handleTwitterShare}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/10"
          >
            <svg
              className="h-4 w-4 text-muted"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share to X (Twitter)
          </button>
          <button
            role="menuitem"
            onClick={handleFacebookShare}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/10"
          >
            <svg
              className="h-4 w-4 text-muted"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Share to Facebook
          </button>
          <button
            role="menuitem"
            onClick={handleWhatsAppShare}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/10"
          >
            <svg
              className="h-4 w-4 text-muted"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share via WhatsApp
          </button>
          <button
            role="menuitem"
            onClick={handleRedditShare}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/10"
          >
            <svg
              className="h-4 w-4 text-muted"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
            Share to Reddit
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
