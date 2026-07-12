"use client";

import { useEffect, useRef, useCallback, useState, memo } from "react";
import Image from "next/image";
import { Play, Heart, ListPlus, Share2, User, Music2 } from "lucide-react";
import { ItunesTrack } from "@/lib/types";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

function BottomSheetBase({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setTranslateY(0);
      onClose();
    }, 300);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleKeyDown]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) {
      setTranslateY(dy);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (translateY > 100) {
      handleClose();
    } else {
      setTranslateY(0);
    }
    dragStartY.current = null;
  }, [translateY, handleClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label={title || "Bottom sheet"}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl glass-heavy border-t border-border/50 shadow-2xl transition-transform duration-300 ${
          isClosing ? "translate-y-full" : ""
        }`}
        style={{
          transform: isClosing
            ? "translateY(100%)"
            : translateY > 0
              ? `translateY(${translateY}px)`
              : "translateY(0)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1.5 w-10 rounded-full bg-foreground/20" aria-hidden="true" />
        </div>

        {/* Title */}
        {title && (
          <div className="border-b border-border/30 px-6 pb-3">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-3 pb-8">{children}</div>
      </div>
    </div>
  );
}

export const BottomSheet = memo(BottomSheetBase);

/**
 * TrackDetailsSheet - a specialized bottom sheet for track details.
 * Shows track info, artwork, preview player, lyrics snippet, and actions.
 */
interface TrackDetailsSheetProps {
  track: ItunesTrack | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
  onFavorite?: () => void;
  onAddToQueue?: () => void;
  onShare?: () => void;
  onViewArtist?: () => void;
  isFavorited?: boolean;
}

function TrackDetailsSheetBase({
  track,
  isOpen,
  onClose,
  onPlay,
  onFavorite,
  onAddToQueue,
  onShare,
  onViewArtist,
  isFavorited = false,
}: TrackDetailsSheetProps) {
  if (!track) return null;

  const artworkUrl = track.artworkUrl100?.replace("100x100", "400x400");
  const durationMs = track.trackTimeMillis;
  const minutes = durationMs ? Math.floor(durationMs / 60000) : 0;
  const seconds = durationMs ? Math.floor((durationMs % 60000) / 1000) : 0;
  const formattedDuration = durationMs
    ? `${minutes}:${seconds.toString().padStart(2, "0")}`
    : "";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Track Details">
      <div className="flex flex-col gap-5">
        {/* Track header with artwork */}
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-border shadow-lg">
            {artworkUrl && (
              <Image
                src={artworkUrl}
                alt={`${track.trackName} artwork`}
                fill
                sizes="80px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="truncate text-base font-bold text-foreground">
              {track.trackName}
            </h3>
            <p className="truncate text-sm text-muted">{track.artistName}</p>
            <p className="truncate text-xs text-muted/70">{track.collectionName}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted/60">
              {formattedDuration && <span>{formattedDuration}</span>}
              {track.primaryGenreName && <span>{track.primaryGenreName}</span>}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <nav className="grid grid-cols-4 gap-2" aria-label="Track actions">
          {onPlay && (
            <button
              onClick={() => {
                onPlay();
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-foreground transition-colors hover:bg-foreground/5 active:scale-95"
              aria-label="Play preview"
            >
              <Play size={20} className="fill-current" />
              <span className="text-[10px] font-medium">Play</span>
            </button>
          )}
          {onFavorite && (
            <button
              onClick={() => {
                onFavorite();
              }}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors hover:bg-foreground/5 active:scale-95 ${
                isFavorited ? "text-red-500" : "text-foreground"
              }`}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={20} className={isFavorited ? "fill-current" : ""} />
              <span className="text-[10px] font-medium">
                {isFavorited ? "Liked" : "Like"}
              </span>
            </button>
          )}
          {onAddToQueue && (
            <button
              onClick={() => {
                onAddToQueue();
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-foreground transition-colors hover:bg-foreground/5 active:scale-95"
              aria-label="Add to queue"
            >
              <ListPlus size={20} />
              <span className="text-[10px] font-medium">Queue</span>
            </button>
          )}
          {onViewArtist && (
            <button
              onClick={() => {
                onViewArtist();
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-foreground transition-colors hover:bg-foreground/5 active:scale-95"
              aria-label="View artist"
            >
              <User size={20} />
              <span className="text-[10px] font-medium">Artist</span>
            </button>
          )}
        </nav>

        {/* Additional info */}
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Music2 size={14} />
            <span>From: {track.collectionName}</span>
          </div>
          {track.releaseDate && (
            <p className="mt-2 text-xs text-muted/70">
              Released: {new Date(track.releaseDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Share action at bottom */}
        {onShare && (
          <button
            onClick={() => {
              onShare();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl glass-card p-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 active:scale-[0.98]"
            aria-label="Share track"
          >
            <Share2 size={16} />
            Share
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

export const TrackDetailsSheet = memo(TrackDetailsSheetBase);
export default BottomSheet;
