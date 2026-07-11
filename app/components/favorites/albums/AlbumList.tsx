"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Heart, Share2, Music } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

interface AlbumListProps {
  albums: ItunesAlbum[];
  onRemove: (collectionId: number) => void;
  onShare: (album: ItunesAlbum) => void;
  onClick: (album: ItunesAlbum) => void;
}

function ListRow({
  album,
  onRemove,
  onShare,
  onClick,
  focused,
  onFocus,
}: {
  album: ItunesAlbum;
  onRemove: (collectionId: number) => void;
  onShare: (album: ItunesAlbum) => void;
  onClick: (album: ItunesAlbum) => void;
  focused: boolean;
  onFocus: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const artworkUrl = album.artworkUrl100?.replace("100x100", "200x200");
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;

  return (
    <tr
      className={`group cursor-pointer border-b border-foreground/5 transition-colors hover:bg-foreground/5 ${
        focused ? "ring-2 ring-accent/50" : ""
      }`}
      onClick={() => onClick(album)}
      onFocus={onFocus}
      tabIndex={0}
      role="row"
      aria-label={`${album.collectionName} by ${album.artistName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(album);
        }
      }}
    >
      {/* Artwork */}
      <td className="py-2 pl-3 pr-2">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          {artworkUrl && !imageFailed ? (
            <Image
              src={artworkUrl}
              alt={`${album.collectionName} artwork`}
              fill
              sizes="48px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
              <Music className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
        </div>
      </td>
      {/* Album name */}
      <td className="py-2 pr-3">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">
          {album.collectionName}
        </p>
      </td>
      {/* Artist */}
      <td className="hidden py-2 pr-3 sm:table-cell">
        <p className="line-clamp-1 text-xs text-muted">{album.artistName}</p>
      </td>
      {/* Year */}
      <td className="hidden py-2 pr-3 md:table-cell">
        <p className="text-xs text-muted">{releaseYear && !isNaN(releaseYear) ? releaseYear : "-"}</p>
      </td>
      {/* Tracks */}
      <td className="hidden py-2 pr-3 md:table-cell">
        <p className="text-xs text-muted">{album.trackCount || "-"}</p>
      </td>
      {/* Genre */}
      <td className="hidden py-2 pr-3 lg:table-cell">
        <p className="text-xs text-muted">{album.primaryGenreName || "-"}</p>
      </td>
      {/* Actions */}
      <td className="py-2 pr-3">
        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(album.collectionId);
            }}
            aria-label={`Remove ${album.collectionName} from favorites`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare(album);
            }}
            aria-label={`Share ${album.collectionName}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AlbumList({
  albums,
  onRemove,
  onShare,
  onClick,
}: AlbumListProps) {
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const containerRef = useRef<HTMLTableSectionElement>(null);

  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(focusedIdx + 1, albums.length - 1);
        setFocusedIdx(next);
        const rows = containerRef.current?.querySelectorAll("tr");
        (rows?.[next] as HTMLElement)?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(focusedIdx - 1, 0);
        setFocusedIdx(prev);
        const rows = containerRef.current?.querySelectorAll("tr");
        (rows?.[prev] as HTMLElement)?.focus();
      }
    },
    [focusedIdx, albums.length]
  );

  return (
    <section aria-label="Album list view">
      <div className="overflow-x-auto rounded-xl glass-subtle">
        <table className="w-full" role="grid" onKeyDown={handleKeyNav}>
          <thead>
            <tr className="border-b border-foreground/10 text-left">
              <th className="py-2 pl-3 pr-2 text-[10px] font-medium uppercase tracking-wider text-muted">
                <span className="sr-only">Artwork</span>
              </th>
              <th className="py-2 pr-3 text-[10px] font-medium uppercase tracking-wider text-muted">
                Album
              </th>
              <th className="hidden py-2 pr-3 text-[10px] font-medium uppercase tracking-wider text-muted sm:table-cell">
                Artist
              </th>
              <th className="hidden py-2 pr-3 text-[10px] font-medium uppercase tracking-wider text-muted md:table-cell">
                Year
              </th>
              <th className="hidden py-2 pr-3 text-[10px] font-medium uppercase tracking-wider text-muted md:table-cell">
                Tracks
              </th>
              <th className="hidden py-2 pr-3 text-[10px] font-medium uppercase tracking-wider text-muted lg:table-cell">
                Genre
              </th>
              <th className="py-2 pr-3 text-[10px] font-medium uppercase tracking-wider text-muted">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody ref={containerRef}>
            {albums.map((album, idx) => (
              <ListRow
                key={album.collectionId}
                album={album}
                onRemove={onRemove}
                onShare={onShare}
                onClick={onClick}
                focused={focusedIdx === idx}
                onFocus={() => setFocusedIdx(idx)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
