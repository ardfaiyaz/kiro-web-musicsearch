"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import type { Collection } from "@/lib/collections";

interface CollectionContextMenuProps {
  collection: Collection;
  onEdit: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export default function CollectionContextMenu({
  collection,
  onEdit,
  onDuplicate,
  onExport,
  onDelete,
}: CollectionContextMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  const actions = [
    { label: "Edit", icon: Pencil, onClick: onEdit },
    { label: "Duplicate", icon: Copy, onClick: onDuplicate },
    { label: "Export JSON", icon: Download, onClick: onExport },
    { label: "Delete", icon: Trash2, onClick: onDelete, destructive: true },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${collection.name}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`Context menu for ${collection.name}`}
          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl glass-heavy p-1.5 shadow-xl animate-fade-in"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
                action.destructive
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-muted hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <action.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
