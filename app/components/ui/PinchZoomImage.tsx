"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface PinchZoomImageProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PinchZoomImage - fullscreen modal for album artwork with pinch-to-zoom
 * on mobile using touch events for scale/translate transforms.
 * The component resets zoom state internally when closed via onClose.
 */
export default function PinchZoomImage({
  src,
  alt,
  isOpen,
  onClose,
}: PinchZoomImageProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const isPinching = useRef(false);

  const handleClose = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const getCenter = (t1: React.Touch, t2: React.Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      lastTouchDistance.current = getDistance(e.touches[0], e.touches[1]);
      lastTouchCenter.current = getCenter(e.touches[0], e.touches[1]);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && isPinching.current) {
        e.preventDefault();
        const newDistance = getDistance(e.touches[0], e.touches[1]);
        const newCenter = getCenter(e.touches[0], e.touches[1]);

        if (lastTouchDistance.current && lastTouchCenter.current) {
          const scaleChange = newDistance / lastTouchDistance.current;
          const newScale = Math.max(0.5, Math.min(scale * scaleChange, 5));
          setScale(newScale);

          const dx = newCenter.x - lastTouchCenter.current.x;
          const dy = newCenter.y - lastTouchCenter.current.y;
          setTranslate((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
          }));
        }

        lastTouchDistance.current = newDistance;
        lastTouchCenter.current = newCenter;
      } else if (e.touches.length === 1 && scale > 1 && !isPinching.current) {
        // Pan when zoomed in
        if (lastTouchCenter.current) {
          const dx = e.touches[0].clientX - lastTouchCenter.current.x;
          const dy = e.touches[0].clientY - lastTouchCenter.current.y;
          setTranslate((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
          }));
        }
        lastTouchCenter.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    },
    [scale]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
        isPinching.current = false;
        lastTouchDistance.current = null;

        // If single finger remains, track it for panning
        if (e.touches.length === 1) {
          lastTouchCenter.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        } else {
          lastTouchCenter.current = null;
        }
      }

      // Snap back if zoomed out too much
      if (scale < 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
    },
    [scale]
  );

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Fullscreen view: ${alt}`}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Close fullscreen view"
      >
        <X size={20} />
      </button>

      {/* Zoom hint */}
      {scale === 1 && (
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/60" aria-hidden="true">
          Pinch to zoom or double-tap
        </p>
      )}

      {/* Image container */}
      <div
        className="flex h-full w-full items-center justify-center touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="relative transition-transform duration-100"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={600}
            height={600}
            className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
