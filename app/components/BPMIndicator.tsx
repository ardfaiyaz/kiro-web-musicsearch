"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";

interface BPMIndicatorProps {
  genre: string;
  durationMs?: number;
  className?: string;
  compact?: boolean;
}

/**
 * Estimates BPM from track genre metadata by mapping genres to typical BPM ranges.
 * Uses genre classification to provide a realistic BPM estimate and displays
 * it as a small badge on track cards and detail pages.
 */

// Genre to BPM range mapping based on typical tempo ranges
const genreBpmMap: Record<string, { min: number; max: number }> = {
  "hip-hop": { min: 80, max: 115 },
  "hip hop": { min: 80, max: 115 },
  rap: { min: 80, max: 115 },
  "r&b": { min: 60, max: 100 },
  rnb: { min: 60, max: 100 },
  soul: { min: 60, max: 100 },
  pop: { min: 100, max: 130 },
  rock: { min: 110, max: 140 },
  "alternative rock": { min: 100, max: 140 },
  "indie rock": { min: 100, max: 135 },
  metal: { min: 120, max: 180 },
  "heavy metal": { min: 120, max: 180 },
  punk: { min: 140, max: 180 },
  "punk rock": { min: 140, max: 180 },
  jazz: { min: 80, max: 160 },
  blues: { min: 60, max: 100 },
  country: { min: 100, max: 130 },
  electronic: { min: 120, max: 150 },
  edm: { min: 125, max: 150 },
  house: { min: 120, max: 130 },
  techno: { min: 125, max: 140 },
  "drum & bass": { min: 160, max: 180 },
  "drum and bass": { min: 160, max: 180 },
  dubstep: { min: 135, max: 145 },
  trance: { min: 125, max: 145 },
  ambient: { min: 60, max: 90 },
  classical: { min: 60, max: 140 },
  reggae: { min: 60, max: 90 },
  reggaeton: { min: 85, max: 100 },
  latin: { min: 90, max: 130 },
  salsa: { min: 150, max: 200 },
  funk: { min: 100, max: 130 },
  disco: { min: 110, max: 130 },
  folk: { min: 80, max: 120 },
  "indie pop": { min: 100, max: 130 },
  dance: { min: 118, max: 135 },
  trap: { min: 130, max: 160 },
  "lo-fi": { min: 70, max: 90 },
  lofi: { min: 70, max: 90 },
  gospel: { min: 80, max: 120 },
  ska: { min: 100, max: 150 },
  grunge: { min: 100, max: 130 },
  "new wave": { min: 110, max: 140 },
  synthwave: { min: 80, max: 118 },
};

function estimateBPM(genre: string, durationMs?: number): number {
  const normalizedGenre = genre.toLowerCase().trim();

  // Try exact match first
  let range = genreBpmMap[normalizedGenre];

  // Try partial match
  if (!range) {
    for (const [key, value] of Object.entries(genreBpmMap)) {
      if (normalizedGenre.includes(key) || key.includes(normalizedGenre)) {
        range = value;
        break;
      }
    }
  }

  // Default range if no genre match
  if (!range) {
    range = { min: 90, max: 130 };
  }

  // Use duration to fine-tune (shorter songs tend to be faster)
  let bias = 0.5;
  if (durationMs) {
    const durationSec = durationMs / 1000;
    if (durationSec < 180) bias = 0.7; // Shorter songs trend faster
    else if (durationSec > 300) bias = 0.3; // Longer songs trend slower
  }

  // Generate a deterministic "random" offset based on genre string
  let hash = 0;
  for (let i = 0; i < normalizedGenre.length; i++) {
    hash = (hash * 31 + normalizedGenre.charCodeAt(i)) & 0xffffffff;
  }
  const genreOffset = (hash % 100) / 100;
  const weightedBias = bias * 0.6 + genreOffset * 0.4;

  return Math.round(range.min + (range.max - range.min) * weightedBias);
}

function getTempoLabel(bpm: number): string {
  if (bpm < 70) return "Very Slow";
  if (bpm < 90) return "Slow";
  if (bpm < 110) return "Moderate";
  if (bpm < 130) return "Upbeat";
  if (bpm < 150) return "Fast";
  return "Very Fast";
}

export default function BPMIndicator({
  genre,
  durationMs,
  className = "",
  compact = false,
}: BPMIndicatorProps) {
  const bpm = useMemo(() => estimateBPM(genre, durationMs), [genre, durationMs]);
  const tempoLabel = useMemo(() => getTempoLabel(bpm), [bpm]);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted ${className}`}
        title={`Estimated ${bpm} BPM (${tempoLabel})`}
        aria-label={`Estimated tempo: ${bpm} beats per minute, ${tempoLabel}`}
      >
        <Activity className="h-2.5 w-2.5" aria-hidden="true" />
        {bpm}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 ${className}`}
      aria-label={`Estimated tempo: ${bpm} beats per minute, ${tempoLabel}`}
    >
      <Activity className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-foreground">{bpm} BPM</span>
        <span className="text-[10px] text-muted">{tempoLabel}</span>
      </div>
    </div>
  );
}
