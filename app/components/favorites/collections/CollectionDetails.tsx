"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  GripVertical,
  Trash2,
  Music,
  Disc3,
  Users,
  Pencil,
  Download,
} from "lucide-react";
import type { Collection, CollectionItem } from "@/lib/collections";
import {
  reorderCollectionItems,
  removeItemFromCollection,
  getCollectionStatistics,
} from "@/lib/collections";
import CollectionCoverGenerator from "./CollectionCoverGenerator";

interface CollectionDetailsProps {
  collection: Collection;
  onBack: () => void;
  onEdit: (collection: Collection) => void;
  onRefresh: () => void;
}

function TypeBadge({ type }: { type: CollectionItem["type"] }) {
  const config = {
    track: { label: "Song", icon: Music, color: "bg-blue-500/20 text-blue-300" },
    album: { label: "Album", icon: Disc3, color: "bg-purple-500/20 text-purple-300" },
    artist: { label: "Artist", icon: Users, color: "bg-green-500/20 text-green-300" },
  };
  const { label, icon: Icon, color } = config[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export default function CollectionDetails({
  collection,
  onBack,
  onEdit,
  onRefresh,
}: CollectionDetailsProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const stats = getCollectionStatistics(collection);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLLIElement>, index: number) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLLIElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLIElement>, toIndex: number) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== toIndex) {
        reorderCollectionItems(collection.id, dragIndex, toIndex);
        onRefresh();
      }
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, collection.id, onRefresh]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleRemoveItem = useCallback(
    (item: CollectionItem) => {
      removeItemFromCollection(collection.id, item.id, item.type);
      onRefresh();
    },
    [collection.id, onRefresh]
  );

  const handleExport = useCallback(() => {
    const data = JSON.stringify(collection, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${collection.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [collection]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-sm font-medium text-foreground transition-premium hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to Collections
      </button>

      {/* Hero area */}
      <section
        aria-label={`Collection: ${collection.name}`}
        className="relative overflow-hidden rounded-3xl glass-ultra p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <CollectionCoverGenerator
            items={collection.items}
            coverStyle={collection.coverStyle || "gradient"}
            size={160}
            className="shrink-0"
          />
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {collection.name}
            </h2>
            {collection.description && (
              <p className="text-sm text-muted">{collection.description}</p>
            )}
            {/* Statistics */}
            <div className="flex flex-wrap gap-4 text-xs text-muted">
              {stats.songs > 0 && (
                <span className="flex items-center gap-1">
                  <Music className="h-3 w-3" aria-hidden="true" />
                  {stats.songs} {stats.songs === 1 ? "song" : "songs"}
                </span>
              )}
              {stats.albums > 0 && (
                <span className="flex items-center gap-1">
                  <Disc3 className="h-3 w-3" aria-hidden="true" />
                  {stats.albums} {stats.albums === 1 ? "album" : "albums"}
                </span>
              )}
              {stats.artists > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {stats.artists} {stats.artists === 1 ? "artist" : "artists"}
                </span>
              )}
              {stats.estimatedDuration > 0 && (
                <span>~{Math.round(stats.estimatedDuration)} min</span>
              )}
            </div>
            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => onEdit(collection)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-premium hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-premium hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content list */}
      <section aria-label="Collection items">
        {collection.items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl glass-subtle py-12 text-center">
            <Music className="h-12 w-12 text-muted" aria-hidden="true" />
            <p className="text-sm text-muted">
              This collection is empty. Add songs, albums, or artists to get
              started.
            </p>
          </div>
        ) : (
          <ul role="list" className="space-y-1">
            {collection.items.map((item, index) => (
              <li
                key={`${item.type}-${item.id}`}
                role="listitem"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${
                  dragOverIndex === index
                    ? "border-2 border-accent/50 bg-accent/5"
                    : "border-2 border-transparent"
                } ${
                  dragIndex === index ? "opacity-50 scale-95" : ""
                } hover:bg-foreground/5`}
              >
                {/* Drag handle */}
                <span
                  className="cursor-grab touch-none text-muted"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="h-4 w-4" />
                </span>

                {/* Artwork */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-foreground/10">
                  {item.artworkUrl ? (
                    <Image
                      src={item.artworkUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-4 w-4 text-muted" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="truncate text-xs text-muted">
                    {item.subtitle}
                  </span>
                </div>

                {/* Type badge */}
                <TypeBadge type={item.type} />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:ring-2 focus-visible:ring-accent/50"
                  aria-label={`Remove ${item.name} from collection`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
