"use client";

import { useSyncExternalStore } from "react";
import { Pencil, Trash2, Copy, MoreHorizontal } from "lucide-react";
import type { Collection } from "@/lib/collections";
import CollectionCoverGenerator from "./CollectionCoverGenerator";

interface CollectionCardProps {
  collection: Collection;
  onOpen: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onDuplicate: (collection: Collection) => void;
}

function subscribeNoop() {
  return () => {};
}

function getClientNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

function formatRelativeTime(timestamp: number, now: number): string {
  if (!timestamp || !now) return "";
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function CollectionCard({
  collection,
  onOpen,
  onEdit,
  onDelete,
  onDuplicate,
}: CollectionCardProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const itemCount = collection.items.length;
  const updatedAt = collection.updatedAt || collection.createdAt;
  const relativeTime = now ? formatRelativeTime(updatedAt, now) : "";

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl glass-medium transition-premium hover-glow hover:scale-[1.02] hover:shadow-xl focus-within:ring-2 focus-within:ring-accent/50"
      aria-label={`Collection: ${collection.name}`}
    >
      {/* Cover Artwork */}
      <button
        type="button"
        onClick={() => onOpen(collection)}
        className="relative aspect-square w-full overflow-hidden focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-label={`Open ${collection.name}`}
      >
        <div className="h-full w-full transition-transform duration-[180ms] group-hover:scale-105">
          <CollectionCoverGenerator
            items={collection.items}
            coverStyle={collection.coverStyle || "gradient"}
            size={400}
            className="!h-full !w-full !rounded-none"
          />
        </div>
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="line-clamp-1 text-xs text-muted">
            {collection.description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted">
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          {relativeTime && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{relativeTime}</span>
            </>
          )}
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div
        className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        role="toolbar"
        aria-label={`Actions for ${collection.name}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(collection);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full glass-heavy text-foreground transition-premium hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label={`Edit ${collection.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(collection);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full glass-heavy text-foreground transition-premium hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label={`Duplicate ${collection.name}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(collection);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full glass-heavy text-red-400 transition-premium hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label={`Delete ${collection.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(collection);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full glass-heavy text-foreground transition-premium hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label={`More options for ${collection.name}`}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}
