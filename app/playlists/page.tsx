"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { usePersonalization } from "@/app/components/PersonalizationContext";
import SmartPlaylists from "@/app/components/SmartPlaylists";
import PlaylistImportExport from "@/app/components/PlaylistImportExport";
import CollaborativePlaylist from "@/app/components/CollaborativePlaylist";
import {
  getPlaylistFolders,
  createPlaylistFolder,
  deletePlaylistFolder,
  addPlaylistToFolder,
  removePlaylistFromFolder,
  PlaylistFolder,
} from "@/lib/playlist-folders";
import { reorderPlaylistTracks } from "@/lib/personalization";

export default function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist, removeTrackFromPlaylist } =
    usePersonalization();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragTrackIdx, setDragTrackIdx] = useState<number | null>(null);
  const [folders, setFolders] = useState<PlaylistFolder[]>(() => {
    if (typeof window === "undefined") return [];
    return getPlaylistFolders();
  });
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const refreshFolders = useCallback(() => {
    setFolders(getPlaylistFolders());
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;
    createPlaylist(name);
    setNewPlaylistName("");
  }

  function handleDelete(playlistId: string) {
    if (expandedId === playlistId) setExpandedId(null);
    deletePlaylist(playlistId);
  }

  function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    createPlaylistFolder(name);
    setNewFolderName("");
    setShowFolderInput(false);
    refreshFolders();
  }

  function handleDeleteFolder(folderId: string) {
    deletePlaylistFolder(folderId);
    refreshFolders();
  }

  function handleMoveToFolder(playlistId: string, folderId: string) {
    addPlaylistToFolder(folderId, playlistId);
    refreshFolders();
  }

  function handleRemoveFromFolder(folderId: string, playlistId: string) {
    removePlaylistFromFolder(folderId, playlistId);
    refreshFolders();
  }

  function toggleFolder(folderId: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }

  // Drag and drop handlers for track reordering
  function handleDragStart(index: number) {
    setDragTrackIdx(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(playlistId: string) {
    if (dragTrackIdx === null || dragOverIndex === null) return;
    if (dragTrackIdx !== dragOverIndex) {
      reorderPlaylistTracks(playlistId, dragTrackIdx, dragOverIndex);
    }
    setDragTrackIdx(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragTrackIdx(null);
    setDragOverIndex(null);
  }

  // Get playlists not in any folder
  const folderPlaylistIds = new Set(folders.flatMap((f) => f.playlistIds));
  const unfolderedPlaylists = playlists.filter((p) => !folderPlaylistIds.has(p.id));

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Playlists
          </h2>
          <p className="mt-3 text-lg text-muted">
            Create and manage your music collections
          </p>
        </header>

        {/* Import/Export */}
        <section className="mb-6 flex items-center justify-between" aria-label="Playlist tools">
          <PlaylistImportExport />
          <button
            type="button"
            onClick={() => setShowFolderInput(!showFolderInput)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground/5 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            New Folder
          </button>
        </section>

        {/* Folder creation */}
        {showFolderInput && (
          <section className="mb-6" aria-label="Create folder">
            <form onSubmit={handleCreateFolder} className="flex gap-3">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="flex-1 rounded-2xl border border-border bg-card px-5 py-3 text-sm text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                aria-label="Folder name"
                autoFocus
              />
              <button type="submit" disabled={!newFolderName.trim()} className="rounded-2xl bg-foreground/10 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed">
                Create
              </button>
            </form>
          </section>
        )}

        {/* Create New Playlist */}
        <section className="mb-10" aria-label="Create new playlist">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name..."
              className="flex-1 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
              aria-label="Playlist name"
            />
            <button type="submit" disabled={!newPlaylistName.trim()} className="rounded-2xl bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-40 disabled:cursor-not-allowed">
              Create
            </button>
          </form>
        </section>

        {/* Smart Playlists */}
        <SmartPlaylists />

        {/* Folders */}
        {folders.length > 0 && (
          <section className="mb-8 space-y-3" aria-label="Playlist folders">
            {folders.map((folder) => {
              const folderPlaylists = playlists.filter((p) => folder.playlistIds.includes(p.id));
              const isExpanded = expandedFolders.has(folder.id);
              return (
                <div key={folder.id} className="rounded-2xl border border-border bg-card/50">
                  <div className="flex items-center justify-between p-4">
                    <button type="button" onClick={() => toggleFolder(folder.id)} className="flex flex-1 items-center gap-3 text-left" aria-expanded={isExpanded}>
                      <svg className={`h-4 w-4 text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                      <svg className="h-5 w-5 text-yellow-500/70" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                      <span className="font-semibold text-foreground">{folder.name}</span>
                      <span className="text-xs text-muted">({folderPlaylists.length})</span>
                    </button>
                    <button type="button" onClick={() => handleDeleteFolder(folder.id)} aria-label={`Delete folder ${folder.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-foreground/5 hover:text-foreground transition-colors">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {isExpanded && folderPlaylists.length > 0 && (
                    <div className="border-t border-border px-4 pb-4 pt-2 space-y-2">
                      {folderPlaylists.map((playlist) => (
                        <div key={playlist.id} className="flex items-center justify-between rounded-xl bg-foreground/5 px-4 py-2.5">
                          <span className="text-sm font-medium text-foreground">{playlist.name}</span>
                          <button type="button" onClick={() => handleRemoveFromFolder(folder.id, playlist.id)} className="text-xs text-muted hover:text-foreground transition-colors">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Playlists List */}
        <section aria-label="Your playlists">
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-foreground/5">
                <svg className="h-12 w-12 text-muted" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">No playlists yet</h3>
              <p className="max-w-md text-muted">
                Create your first playlist above and start adding tracks from song detail pages.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unfolderedPlaylists.map((playlist) => (
                <div key={playlist.id} className="overflow-hidden rounded-2xl border border-border bg-card transition-all">
                  <div className="flex items-center justify-between p-5 sm:p-6">
                    <button type="button" onClick={() => setExpandedId(expandedId === playlist.id ? null : playlist.id)} className="flex flex-1 items-center gap-4 text-left" aria-expanded={expandedId === playlist.id}>
                      {/* Playlist mosaic cover */}
                      <PlaylistMosaicCover tracks={playlist.tracks} />
                      <div>
                        <h3 className="font-semibold text-foreground">{playlist.name}</h3>
                        <p className="text-sm text-muted">{playlist.tracks.length} {playlist.tracks.length === 1 ? "track" : "tracks"}</p>
                      </div>
                      <svg className={`ml-auto h-5 w-5 text-muted transition-transform duration-300 ${expandedId === playlist.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <div className="ml-4 flex items-center gap-2">
                      {/* Move to folder */}
                      {folders.length > 0 && (
                        <select
                          onChange={(e) => { if (e.target.value) handleMoveToFolder(playlist.id, e.target.value); e.target.value = ""; }}
                          className="h-9 rounded-lg border border-border bg-card px-2 text-xs text-muted"
                          aria-label={`Move ${playlist.name} to folder`}
                          defaultValue=""
                        >
                          <option value="" disabled>Move to...</option>
                          {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      )}
                      <CollaborativePlaylist playlist={playlist} />
                      <button type="button" onClick={() => handleDelete(playlist.id)} aria-label={`Delete playlist ${playlist.name}`} className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Tracks with drag-and-drop */}
                  {expandedId === playlist.id && (
                    <div className="border-t border-border">
                      {playlist.tracks.length === 0 ? (
                        <p className="px-6 py-5 text-sm text-muted">
                          No tracks in this playlist yet. Browse tracks and add them from the track detail page.
                        </p>
                      ) : (
                        <ul className="divide-y divide-border/50">
                          {playlist.tracks.map((track, index) => (
                            <li
                              key={track.trackId}
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDrop={() => handleDrop(playlist.id)}
                              onDragEnd={handleDragEnd}
                              className={`flex items-center gap-3 px-5 py-3.5 sm:px-6 transition-colors ${
                                dragOverIndex === index ? "bg-foreground/5" : ""
                              }`}
                            >
                              {/* Drag handle */}
                              <button type="button" className="cursor-grab shrink-0 text-muted hover:text-foreground active:cursor-grabbing" aria-label="Drag to reorder">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                              </button>
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-border">
                                {track.artworkUrl100 ? (
                                  <Image src={track.artworkUrl100} alt="" fill sizes="40px" className="object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <Link href={`/track/${track.trackId}`} className="block truncate text-sm font-medium text-foreground transition-colors hover:text-muted">
                                  {track.trackName}
                                </Link>
                                <p className="truncate text-xs text-muted">{track.artistName}</p>
                              </div>
                              <button type="button" onClick={() => removeTrackFromPlaylist(playlist.id, track.trackId)} aria-label={`Remove ${track.trackName} from playlist`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Mosaic cover component for playlists
function PlaylistMosaicCover({ tracks }: { tracks: { artworkUrl100?: string }[] }) {
  const artworks = tracks.filter((t) => t.artworkUrl100).map((t) => t.artworkUrl100 as string).slice(0, 4);

  if (artworks.length === 0) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5">
        <svg className="h-6 w-6 text-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      </div>
    );
  }

  if (artworks.length < 4) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-border">
        <Image src={artworks[0]} alt="" fill sizes="48px" className="object-cover" />
      </div>
    );
  }

  return (
    <div className="grid h-12 w-12 shrink-0 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl">
      {artworks.map((url, i) => (
        <div key={i} className="relative overflow-hidden">
          <Image src={url} alt="" fill sizes="24px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
