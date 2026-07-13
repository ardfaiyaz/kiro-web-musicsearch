"use client";

import { useState } from "react";
import { usePersonalization } from "@/app/components/PersonalizationContext";
import { Playlist } from "@/lib/personalization";

interface CollaborativePlaylistProps {
  playlist: Playlist;
}

export default function CollaborativePlaylist({
  playlist,
}: CollaborativePlaylistProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const data = {
      name: playlist.name,
      tracks: playlist.tracks.map((t) => ({
        trackId: t.trackId,
        trackName: t.trackName,
        artistName: t.artistName,
        artworkUrl100: t.artworkUrl100,
        collectionName: t.collectionName,
        primaryGenreName: t.primaryGenreName,
        previewUrl: t.previewUrl,
        trackTimeMillis: t.trackTimeMillis,
        releaseDate: t.releaseDate,
        trackViewUrl: t.trackViewUrl,
        collectionViewUrl: t.collectionViewUrl,
        kind: t.kind,
        wrapperType: t.wrapperType,
        artistId: t.artistId,
      })),
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    const url = `${window.location.origin}/playlists/shared?data=${encoded}`;
    setShareUrl(url);
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="space-y-3">
      {!shareUrl ? (
        <button
          type="button"
          onClick={handleShare}
          disabled={playlist.tracks.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/10 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Share ${playlist.name}`}
        >
          <svg
            className="h-3.5 w-3.5"
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
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted truncate"
            aria-label="Share URL"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

export function SharedPlaylistImporter({
  encodedData,
}: {
  encodedData: string;
}) {
  const { createPlaylist, addTrackToPlaylist } = usePersonalization();
  const [imported, setImported] = useState(false);
  const [error, setError] = useState(false);

  let playlistData: { name: string; tracks: Playlist["tracks"] } | null = null;
  try {
    const decoded = decodeURIComponent(atob(encodedData));
    playlistData = JSON.parse(decoded);
  } catch {
    // Invalid data
  }

  function handleImport() {
    if (!playlistData) {
      setError(true);
      return;
    }
    createPlaylist(playlistData.name);
    // Get the latest playlists to find the newly created one
    setTimeout(() => {
      const stored = JSON.parse(
        localStorage.getItem("music-search-playlists") || "[]"
      ) as Playlist[];
      const created = stored[stored.length - 1];
      if (created) {
        for (const track of playlistData!.tracks) {
          addTrackToPlaylist(created.id, track);
        }
      }
      setImported(true);
    }, 100);
  }

  if (error || !playlistData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-muted">
          Invalid or corrupted share link. Please ask for a new link.
        </p>
      </div>
    );
  }

  if (imported) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
          <svg
            className="h-6 w-6 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Playlist Imported!
        </h3>
        <p className="mt-1 text-sm text-muted">
          &quot;{playlistData.name}&quot; has been added to your playlists.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <h3 className="text-lg font-semibold text-foreground">
        Shared Playlist
      </h3>
      <p className="mt-2 text-muted">
        &quot;{playlistData.name}&quot; - {playlistData.tracks.length} tracks
      </p>
      <button
        type="button"
        onClick={handleImport}
        className="mt-4 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Add to My Playlists
      </button>
    </div>
  );
}
