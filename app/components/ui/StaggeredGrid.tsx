"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface StaggeredGridProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

/**
 * StaggeredGrid - Cards appear one-by-one with stagger using
 * Intersection Observer and CSS animation-delay.
 * Respects reduced motion settings.
 */
export default function StaggeredGrid({
  children,
  className = "",
  staggerDelay = 80,
}: StaggeredGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reducedMotion) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, handleIntersection]);

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className={`staggered-grid-item ${
            reducedMotion || isVisible
              ? "staggered-grid-item-visible"
              : ""
          }`}
          style={
            !reducedMotion && isVisible
              ? { animationDelay: `${i * staggerDelay}ms` }
              : undefined
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}
