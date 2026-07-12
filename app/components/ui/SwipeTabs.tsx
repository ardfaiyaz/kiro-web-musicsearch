"use client";

import { useRef, useCallback, ReactNode } from "react";

interface SwipeTabsProps {
  children: ReactNode;
  currentIndex: number;
  tabCount: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  className?: string;
}

/**
 * SwipeTabs - wrapper component that detects horizontal swipe gestures
 * for tab navigation on touch devices.
 * Swipe left to go to next tab, swipe right to go to previous tab.
 */
export default function SwipeTabs({
  children,
  currentIndex,
  tabCount,
  onSwipeLeft,
  onSwipeRight,
  className = "",
}: SwipeTabsProps) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);

    // Mark as swiping if horizontal movement dominates
    if (dx > dy && dx > 15) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;

      // Only trigger on horizontal swipes that are fast enough
      if (
        isSwiping.current &&
        Math.abs(dx) > 50 &&
        Math.abs(dx) > Math.abs(dy) * 1.5 &&
        elapsed < 500
      ) {
        if (dx < 0 && currentIndex < tabCount - 1) {
          onSwipeLeft();
        } else if (dx > 0 && currentIndex > 0) {
          onSwipeRight();
        }
      }

      touchStartRef.current = null;
      isSwiping.current = false;
    },
    [currentIndex, tabCount, onSwipeLeft, onSwipeRight]
  );

  return (
    <div
      className={`touch-pan-y ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Swipeable tab content"
      aria-roledescription="swipeable area"
    >
      {children}
    </div>
  );
}
