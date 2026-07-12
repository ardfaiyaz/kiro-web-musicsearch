"use client";

import { useRef, useCallback, useState, ReactNode } from "react";
import { Heart } from "lucide-react";

interface SwipeToFavoriteProps {
  children: ReactNode;
  onFavorite: () => void;
  isFavorited: boolean;
  className?: string;
}

/**
 * SwipeToFavorite - wraps track cards with horizontal swipe detection.
 * Swiping right reveals a heart icon and favorites the track with
 * visual feedback (green background reveal).
 */
export default function SwipeToFavorite({
  children,
  onFavorite,
  isFavorited,
  className = "",
}: SwipeToFavoriteProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const isSwiping = useRef(false);

  const THRESHOLD = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    isSwiping.current = false;
    setShowFeedback(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);

    // Only track horizontal swipes to the right
    if (dx > 10 && dx > dy * 1.5) {
      isSwiping.current = true;
      const offset = Math.min(dx * 0.6, 120);
      setSwipeOffset(offset);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;

    if (isSwiping.current && swipeOffset >= THRESHOLD && !isFavorited) {
      setShowFeedback(true);
      onFavorite();

      // Reset with a delay for visual feedback
      setTimeout(() => {
        setSwipeOffset(0);
        setShowFeedback(false);
      }, 600);
    } else {
      setSwipeOffset(0);
    }

    touchStartRef.current = null;
    isSwiping.current = false;
  }, [swipeOffset, onFavorite, isFavorited]);

  const progress = Math.min(swipeOffset / THRESHOLD, 1);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Background reveal on swipe */}
      <div
        className={`absolute inset-0 flex items-center pl-6 transition-colors duration-200 ${
          showFeedback || progress >= 1
            ? "bg-green-500/20"
            : progress > 0
              ? "bg-green-500/10"
              : "bg-transparent"
        }`}
        aria-hidden="true"
      >
        <Heart
          size={24}
          className={`transition-all duration-200 ${
            showFeedback || progress >= 1
              ? "text-green-500 fill-green-500 scale-110"
              : "text-green-500/60"
          }`}
          style={{
            opacity: progress,
            transform: `scale(${0.6 + progress * 0.5})`,
          }}
        />
      </div>

      {/* Swipeable content */}
      <div
        className="relative z-10 transition-transform duration-150"
        style={{
          transform: swipeOffset > 0 ? `translateX(${swipeOffset}px)` : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
