"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  containerHeight?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * VirtualList renders only visible items plus a buffer (overscan) using
 * Intersection Observer-based windowing. Ideal for lists with 100+ items.
 */
export default function VirtualList<T>({
  items,
  itemHeight,
  overscan = 5,
  renderItem,
  className = "",
  containerHeight,
  getItemKey,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(containerHeight || 600);

  // Update viewport height on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (containerHeight) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [containerHeight]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      setScrollTop(container.scrollTop);
    }
  }, []);

  const { visibleItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    const visible = items.slice(start, end + 1).map((item, i) => ({
      item,
      index: start + i,
    }));

    return {
      visibleItems: visible,
    };
  }, [items, itemHeight, scrollTop, viewportHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  if (items.length === 0) return null;

  // For small lists, render directly without virtualization
  if (items.length <= 20) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={getItemKey ? getItemKey(item, index) : index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight || "100%", maxHeight: containerHeight || "80vh" }}
      role="list"
      aria-label="Virtual scrolling list"
    >
      <div
        style={{ height: totalHeight, position: "relative" }}
        aria-hidden="true"
      >
        {visibleItems.map(({ item, index }) => (
          <div
            key={getItemKey ? getItemKey(item, index) : index}
            style={{
              position: "absolute",
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
            role="listitem"
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for components that want intersection-observer-based lazy rendering
export function useIntersectionVisibility(
  threshold = 0.1
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}
