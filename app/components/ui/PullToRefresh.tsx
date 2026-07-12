"use client";

import { useRef, useCallback, useState, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => void;
  className?: string;
}

/**
 * PullToRefresh - detects pull-down gesture on mobile to trigger
 * a refresh action with a spinner animation at the top.
 */
export default function PullToRefresh({
  children,
  onRefresh,
  className = "",
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ y: number } | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const THRESHOLD = 80;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return;
      const container = containerRef.current;
      // Only allow pull when scrolled to top
      if (container && container.scrollTop <= 0) {
        touchStartRef.current = { y: e.touches[0].clientY };
      }
    },
    [isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || isRefreshing) return;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      if (dy > 0) {
        // Apply resistance factor for natural feel
        const distance = Math.min(dy * 0.4, 120);
        setPullDistance(distance);
      }
    },
    [isRefreshing]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;

    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD * 0.6);

      // Trigger refresh
      if (onRefresh) {
        onRefresh();
      }

      // Simulate refresh completion
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1200);
    } else {
      setPullDistance(0);
    }

    touchStartRef.current = null;
  }, [pullDistance, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance > 0 ? `${pullDistance}px` : "0px" }}
        aria-hidden="true"
      >
        <div
          className={`flex items-center justify-center rounded-full p-2 ${
            isRefreshing ? "animate-spin" : ""
          }`}
          style={{
            opacity: progress,
            transform: `rotate(${progress * 360}deg)`,
          }}
        >
          <RefreshCw
            size={20}
            className={`text-foreground/70 ${isRefreshing ? "text-[var(--primary)]" : ""}`}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="transition-transform duration-200"
        style={{
          transform:
            pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        }}
      >
        {children}
      </div>

      {/* Screen reader announcement */}
      {isRefreshing && (
        <div className="sr-only" aria-live="polite">
          Refreshing content
        </div>
      )}
    </div>
  );
}
