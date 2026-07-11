"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import { Play, ListPlus, Heart, Share2, User, ExternalLink } from "lucide-react";

export interface ContextMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

function ContextMenuBase({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="glass-heavy fixed z-[200] min-w-[180px] overflow-hidden rounded-xl border border-border/50 p-1 shadow-xl animate-scale-in"
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Context menu"
    >
      {items.map((item, index) => (
        <button
          key={index}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-premium hover:bg-foreground/5 ${
            item.destructive ? "text-error" : "text-foreground"
          }`}
          role="menuitem"
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          <span className="shrink-0" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export const ContextMenu = memo(ContextMenuBase);

export function getTrackContextMenuItems(options: {
  onPlay?: () => void;
  onAddToQueue?: () => void;
  onAddToFavorites?: () => void;
  onShare?: () => void;
  onViewArtist?: () => void;
}): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (options.onPlay) {
    items.push({
      label: "Play",
      icon: <Play size={16} />,
      onClick: options.onPlay,
    });
  }
  if (options.onAddToQueue) {
    items.push({
      label: "Add to Queue",
      icon: <ListPlus size={16} />,
      onClick: options.onAddToQueue,
    });
  }
  if (options.onAddToFavorites) {
    items.push({
      label: "Add to Favorites",
      icon: <Heart size={16} />,
      onClick: options.onAddToFavorites,
    });
  }
  if (options.onViewArtist) {
    items.push({
      label: "View Artist",
      icon: <User size={16} />,
      onClick: options.onViewArtist,
    });
  }
  if (options.onShare) {
    items.push({
      label: "Share",
      icon: <Share2 size={16} />,
      onClick: options.onShare,
    });
  }

  return items;
}

export function getArtistContextMenuItems(options: {
  onViewArtist?: () => void;
  onAddToFavorites?: () => void;
  onOpenExternal?: () => void;
}): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (options.onViewArtist) {
    items.push({
      label: "View Artist",
      icon: <User size={16} />,
      onClick: options.onViewArtist,
    });
  }
  if (options.onAddToFavorites) {
    items.push({
      label: "Add to Favorites",
      icon: <Heart size={16} />,
      onClick: options.onAddToFavorites,
    });
  }
  if (options.onOpenExternal) {
    items.push({
      label: "Open in iTunes",
      icon: <ExternalLink size={16} />,
      onClick: options.onOpenExternal,
    });
  }

  return items;
}

export default ContextMenu;
