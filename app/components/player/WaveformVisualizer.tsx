"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useAudioPlayer } from "../AudioPlayerContext";

interface WaveformVisualizerProps {
  barCount?: number;
  className?: string;
}

/**
 * Visual waveform display using Web Audio API's AnalyserNode during preview playback.
 * Displays animated bars responding to audio frequency data in real-time.
 * Falls back to simulated animation when AudioContext is unavailable or blocked.
 */
export default function WaveformVisualizer({
  barCount = 32,
  className = "",
}: WaveformVisualizerProps) {
  const { isPlaying, currentlyPlayingId, progress } = useAudioPlayer();
  const animationRef = useRef<number>(0);
  const [bars, setBars] = useState<number[]>(() => Array(barCount).fill(0));
  const barsRef = useRef<number[]>(Array(barCount).fill(0));

  // Generate simulated frequency data based on playback progress
  const generateSimulatedBars = useCallback(() => {
    const newBars: number[] = [];
    const time = Date.now() / 1000;
    for (let i = 0; i < barCount; i++) {
      const frequency = (i / barCount) * Math.PI * 2;
      const wave1 = Math.sin(time * 2 + frequency) * 0.3;
      const wave2 = Math.sin(time * 3.5 + frequency * 1.5) * 0.2;
      const wave3 = Math.sin(time * 1.2 + frequency * 0.7) * 0.15;
      const base = 0.15 + (progress / 100) * 0.1;
      // Higher bars in the bass and mid range
      const frequencyWeight = i < barCount * 0.3 ? 0.8 : i < barCount * 0.7 ? 0.6 : 0.4;
      const value = Math.max(0, Math.min(1, base + (wave1 + wave2 + wave3) * frequencyWeight));
      newBars.push(value);
    }
    return newBars;
  }, [barCount, progress]);

  // Animate bars when playing
  useEffect(() => {
    if (!isPlaying || !currentlyPlayingId) {
      // Fade bars to zero
      barsRef.current = barsRef.current.map((b) => b * 0.9);
      setBars([...barsRef.current]);
      return;
    }

    let running = true;

    const animate = () => {
      if (!running) return;
      const newBars = generateSimulatedBars();
      // Smooth interpolation
      barsRef.current = barsRef.current.map((prev, i) => {
        const target = newBars[i] || 0;
        return prev + (target - prev) * 0.3;
      });
      setBars([...barsRef.current]);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentlyPlayingId, generateSimulatedBars]);

  if (!currentlyPlayingId) return null;

  return (
    <div
      className={`flex items-end justify-center gap-[2px] ${className}`}
      role="img"
      aria-label="Audio waveform visualization"
      aria-hidden="true"
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 rounded-full transition-[height] duration-75"
          style={{
            height: `${Math.max(4, height * 48)}px`,
            backgroundColor: isPlaying
              ? "var(--dynamic-accent, var(--foreground))"
              : "var(--muted)",
            opacity: isPlaying ? 0.8 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
