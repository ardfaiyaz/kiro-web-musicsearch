"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, Share2 } from "lucide-react";

interface ArtworkViewerProps {
  artworkUrl: string;
  albumName: string;
  artistName: string;
  onClose: () => void;
}

export default function ArtworkViewer({
  artworkUrl,
  albumName,
  artistName,
  onClose,
}: ArtworkViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  // Trap focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const focusableElements = overlay.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    overlay.addEventListener("keydown", handleTab);
    return () => overlay.removeEventListener("keydown", handleTab);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setTranslate({ x: 0, y: 0 });
      return newScale;
    });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
    },
    [scale, translate]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTranslate({
        x: translateStart.current.x + dx,
        y: translateStart.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleShare = useCallback(async () => {
    const shareText = `${albumName} by ${artistName}`;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Clipboard unavailable
    }
  }, [albumName, artistName]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${albumName} artwork viewer`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-xl"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={handleZoomOut}
          className="glass-medium flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10"
          aria-label="Zoom out"
          disabled={scale <= 1}
        >
          <ZoomOut className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          className="glass-medium flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10"
          aria-label="Zoom in"
          disabled={scale >= 3}
        >
          <ZoomIn className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="glass-medium flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10"
          aria-label="Share album info"
        >
          <Share2 className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="glass-medium flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10"
          aria-label="Close artwork viewer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Artwork */}
      <div
        className="relative z-10 max-h-[80vh] max-w-[80vw]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
      >
        <div
          className="relative aspect-square h-[70vh] max-h-[70vw] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-200"
          style={{
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          }}
        >
          <Image
            src={artworkUrl}
            alt={`${albumName} high resolution artwork`}
            fill
            sizes="80vw"
            className="object-cover"
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* Album info */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="glass-medium rounded-full px-6 py-3 text-center">
          <p className="text-sm font-semibold text-foreground">{albumName}</p>
          <p className="text-xs text-muted">{artistName}</p>
        </div>
      </div>
    </div>
  );
}
