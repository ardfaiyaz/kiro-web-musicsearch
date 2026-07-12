"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
  letterDelay?: number;
}

/**
 * TextReveal - Animates text in letter-by-letter using CSS animation-delay
 * on individual spans. Respects reduced motion settings.
 */
export default function TextReveal({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  letterDelay = 30,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
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
      threshold: 0.2,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, handleIntersection]);

  if (reducedMotion) {
    return (
      <Tag ref={containerRef as React.RefObject<HTMLHeadingElement>} className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      className={`${className} text-reveal-container`}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`inline-block text-reveal-letter ${isVisible ? "text-reveal-visible" : ""}`}
          style={{
            animationDelay: isVisible
              ? `${delay + i * letterDelay}ms`
              : undefined,
          }}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
