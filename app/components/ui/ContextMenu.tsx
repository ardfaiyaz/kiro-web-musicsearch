"use client";

import { useEffect, useRef, useCallback, memo, useState, ReactNode } from "react";
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

/**
 * LongPressWrapper - wraps a component with long-press detection (500ms timeout).
 * On long-press, shows a context menu at the press position.
 */
export function LongPressWrapper({
  children,
  items,
  className = "",
}: {
  children: ReactNode;
  items: ContextMenuItem[];
  className?: string;
}) {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const didLongPress = useRef(false);

  const clearTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      didLongPress.current = false;

      longPressTimer.current = setTimeout(() => {
        didLongPress.current = true;
        setMenuPosition({
          x: touch.clientX,
          y: touch.clientY,
        });
      }, 500);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartPos.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);

      // Cancel long press if finger moves too far
      if (dx > 10 || dy > 10) {
        clearTimer();
      }
    },
    [clearTimer]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearTimer();
      // Prevent click from firing if long press was triggered
      if (didLongPress.current) {
        e.preventDefault();
      }
    },
    [clearTimer]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuPosition(null);
  }, []);

  return (
    <>
      <div
        className={className}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>
      {menuPosition && (
        <ContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          items={items}
          onClose={closeMenu}
        />
      )}
    </>
  );
}

export default ContextMenu;
