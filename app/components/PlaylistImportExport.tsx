"use client";

import { useRef } from "react";
import { usePersonalization } from "@/app/components/PersonalizationContext";
import { Playlist } from "@/lib/personalization";

export default function PlaylistImportExport() {
  const { playlists, createPlaylist, addTrackToPlaylist } =
    usePersonalization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    if (playlists.length === 0) return;
    const data = JSON.stringify(playlists, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `playlists-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content) as Playlist[];
        if (!Array.isArray(imported)) return;

        for (const playlist of imported) {
          if (!playlist.name || !Array.isArray(playlist.tracks)) continue;
          createPlaylist(playlist.name);
          // We need to get the latest playlists to find the new one
          // Since createPlaylist adds to storage, we add tracks after
          setTimeout(() => {
            const stored = JSON.parse(
              localStorage.getItem("music-search-playlists") || "[]"
            ) as Playlist[];
            const created = stored.find(
              (p) =>
                p.name === playlist.name &&
                !imported.some((ip) => ip.id === p.id && ip.id !== playlist.id)
            );
            if (created) {
              for (const track of playlist.tracks) {
                addTrackToPlaylist(created.id, track);
              }
            }
          }, 100);
        }
      } catch {
        // Invalid JSON file
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={playlists.length === 0}
        className="inline-flex items-center gap-1.5 rounded-xl bg-foreground/5 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Export playlists as JSON"
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
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Export
      </button>
      <button
        type="button"
        onClick={handleImport}
        className="inline-flex items-center gap-1.5 rounded-xl bg-foreground/5 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
        aria-label="Import playlists from JSON file"
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
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
