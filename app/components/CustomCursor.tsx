"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "./SettingsContext";

export default function CustomCursor() {
  const { settings } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const trailPositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!container || !cursor || !trail) return;

    // Only render on non-touch devices with fine pointer
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    // Respect reduced motion
    if (settings.reducedMotion) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (prefersReducedMotion.matches) return;

    container.style.display = "block";
    document.body.classList.add("custom-cursor-active");

    function animate() {
      if (cursor) {
        cursor.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
      }

      // Trail follows with easing
      const dx = positionRef.current.x - trailPositionRef.current.x;
      const dy = positionRef.current.y - trailPositionRef.current.y;
      trailPositionRef.current.x += dx * 0.15;
      trailPositionRef.current.y += dy * 0.15;

      if (trail) {
        trail.style.transform = `translate(${trailPositionRef.current.x}px, ${trailPositionRef.current.y}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, [role='button'], input, select, textarea, .cursor-pointer"
      );
      if (interactive) {
        cursor.style.width = "12px";
        cursor.style.height = "12px";
        cursor.style.backgroundColor = "var(--dynamic-accent, var(--foreground))";
        trail.style.width = "48px";
        trail.style.height = "48px";
        trail.style.borderColor = "var(--dynamic-accent, var(--foreground))";
        trail.style.opacity = "0.6";
      } else {
        cursor.style.width = "8px";
        cursor.style.height = "8px";
        cursor.style.backgroundColor = "var(--foreground)";
        trail.style.width = "32px";
        trail.style.height = "32px";
        trail.style.borderColor = "var(--foreground)";
        trail.style.opacity = "0.3";
      }
    };

    const handleMouseLeave = () => {
      container.style.display = "none";
    };

    const handleMouseEnter = () => {
      container.style.display = "block";
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
      document.documentElement.removeEventListener(
        "mouseenter",
        handleMouseEnter
      );
      document.body.classList.remove("custom-cursor-active");
      container.style.display = "none";
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [settings.reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ display: "none" }}
    >
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color] duration-200"
        style={{
          width: "8px",
          height: "8px",
          backgroundColor: "var(--foreground)",
        }}
      />
      {/* Trailing circle */}
      <div
        ref={trailRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,border-color,opacity] duration-300"
        style={{
          width: "32px",
          height: "32px",
          borderColor: "var(--foreground)",
          opacity: 0.3,
        }}
      />
    </div>
  );
}
