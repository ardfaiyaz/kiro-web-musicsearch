"use client";

import { useState, useCallback } from "react";

interface ParticleBurst {
  id: number;
  x: number;
  y: number;
}

/**
 * ParticleEffect - Provides a CSS-only particle burst animation.
 * Wrap an interactive element and call `triggerBurst` to emit particles
 * from a given coordinate, typically when the user favorites a song.
 */
export function useParticleBurst() {
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);

  const triggerBurst = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setBursts((prev) => [...prev, { id, x, y }]);
    // Remove burst after animation completes
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 800);
  }, []);

  return { bursts, triggerBurst };
}

interface ParticleEffectProps {
  bursts: ParticleBurst[];
}

const PARTICLE_COUNT = 12;

export default function ParticleEffect({ bursts }: ParticleEffectProps) {
  if (bursts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute"
          style={{ left: burst.x, top: burst.y }}
        >
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const angle = (360 / PARTICLE_COUNT) * i;
            const distance = 30 + Math.random() * 40;
            const size = 4 + Math.random() * 4;
            const hue = 340 + Math.random() * 40; // pinkish/red hearts
            return (
              <span
                key={i}
                className="absolute block rounded-full particle-burst-item"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: `hsl(${hue}, 80%, 60%)`,
                  // Use CSS custom properties for the animation
                  "--particle-x": `${Math.cos((angle * Math.PI) / 180) * distance}px`,
                  "--particle-y": `${Math.sin((angle * Math.PI) / 180) * distance}px`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
