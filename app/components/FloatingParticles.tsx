"use client";

import { useSettings } from "./SettingsContext";
import { useState } from "react";

interface Particle {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface FloatingParticlesProps {
  className?: string;
  count?: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${((i * 37 + 13) % 100)}%`,
    size: (i % 3) + 2,
    duration: 10 + (i * 1.7) % 15,
    delay: (i * 2.3) % 10,
    opacity: 0.2 + ((i * 0.07) % 0.4),
  }));
}

export default function FloatingParticles({
  className = "",
  count = 10,
}: FloatingParticlesProps) {
  const { settings } = useSettings();
  const [particles] = useState<Particle[]>(() => generateParticles(count));

  // Respect reduced motion
  if (settings.reducedMotion) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: "var(--dynamic-accent, var(--muted))",
            opacity: particle.opacity,
            animation: `floatParticle ${particle.duration}s linear ${particle.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
